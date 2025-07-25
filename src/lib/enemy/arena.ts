import Decimal from "break_infinity.js";
import type Player from "../player/player";
import type { SaverLoader } from "../saveload/saveload";
import { getGame } from "../singleton";
import { clamp } from "../utils";
import Enemy, { EnemyType, type EnemyDrop } from "./enemy";
import { getWorldDataForStage, ISEKAI_BASE } from "./world";
import { formatRoman } from "../format";

export default class Arena implements SaverLoader {
    currentStage: number = 0;
    maxStage: number = 0;
    maxStageLifetime: number = 0;
    isBossActive: boolean = false;

    currentEnemy: Enemy;

    constructor() {
        this.currentEnemy = this.getNewEnemy();
    }

    private getBaseHp(stage: number): Decimal {
        const PHI = 1.618;
        return new Decimal(50).mul(Decimal.pow(PHI, stage * 5));
    }

    generateEnemy(): Enemy {
        const hp = this.getBaseHp(this.currentStage).mul(
            0.75 + 0.5 * Math.random(),
        );
        const tier = Math.min(2, Math.floor(-Math.log2(1 - Math.random())));

        return new Enemy(hp, EnemyType.NORMAL, tier);
    }

    generateBoss(): Enemy {
        const hp = this.getBaseHp(this.currentStage).mul(20);

        return new Enemy(hp, EnemyType.BOSS, 0);
    }

    getNewEnemy(): Enemy {
        if (this.isOnHighestStage && this.isBossActive) {
            return this.generateBoss();
        }
        return this.generateEnemy();
    }

    /**
     * Hit the Enemy in this Arena.
     *
     * @param damage Amount to damage to deal
     * @returns A piece of Equipment if it was dropped, null otherwise
     */
    hitEnemy(damage: Decimal): EnemyDrop | null {
        this.currentEnemy.hit(damage);
        if (this.currentEnemy.dead) {
            const player = getGame().player;

            const drop = this.currentEnemy.generateDrop();
            const wasBoss = this.currentEnemy.type === EnemyType.BOSS;
            if (wasBoss && this.isOnHighestStage) {
                this.maxStage++;
                this.maxStageLifetime = Math.max(this.maxStageLifetime, this.maxStage);
                this.gotoMaxStage();
                this.isBossActive = false;
                player.heal();
            }
            this.currentEnemy = this.getNewEnemy();

            // automatically activate boss if very strong
            if (
                player
                    .getOverkillForHealth(this.getBaseHp(this.currentStage))
                    .gt(8)
            ) {
                this.activateBoss();
            }

            return drop;
        }
        return null;
    }

    hitPlayer(player: Player): void {
        player.hit(this.currentEnemy.damage);
        // When the player dies, kills are being reset
        if (player.dead) {
            player.heal();
            this.currentEnemy = this.getNewEnemy();
        }
    }

    get isOnLowestStage(): boolean {
        return this.currentStage <= 0;
    }

    get isOnHighestStage(): boolean {
        return this.currentStage === this.maxStage;
    }

    get stageData() {
        return getWorldDataForStage(this.currentStage);
    }

    get stageName(): string {
        const data = this.stageData;
        return `${data.title} ${this.currentStage - data.stage + 1}`;
    }

    get isekaiName(): string {
        const data = this.stageData;
        return data.isekai ? `Isekai ${formatRoman(data.isekai)}` : "Home World"
    }

    get positionName(): string {
        if (this.maxStageLifetime >= ISEKAI_BASE) return this.isekaiName + " - " + this.stageName;
        else return this.stageName;
    }

    /* Stage Navigation */

    gotoStage(stage: number) {
        const actualStage = clamp(stage, 0, this.maxStage);
        this.currentStage = actualStage;
        this.currentEnemy = this.getNewEnemy();
    }

    gotoMaxStage() {
        this.gotoStage(this.maxStage);
    }

    nextStage() {
        this.gotoStage(this.currentStage + 1);
    }

    prevStage() {
        this.gotoStage(this.currentStage - 1);
    }

    activateBoss() {
        if (this.isOnHighestStage) {
            this.isBossActive = true;
            this.currentEnemy = this.getNewEnemy();
        }
    }

    deactivateBoss() {
        this.isBossActive = false;
        this.currentEnemy = this.getNewEnemy();
    }

    reset() {
        this.currentStage = 0;
        this.maxStage = 0;
        this.isBossActive = false;
        this.currentEnemy = this.getNewEnemy();
    }

    save() {
        return {
            currentStage: this.currentStage,
            maxStage: this.maxStage,
            maxStageLifetime: this.maxStageLifetime,
            isBossActive: this.isBossActive,
            currentEnemy: this.currentEnemy.save(),
        };
    }

    load(data: any): void {
        this.currentStage = data.currentStage;
        this.maxStage = data.maxStage;
        this.maxStageLifetime = data.maxStageLifetime || 0;
        this.isBossActive = data.isBossActive;
        this.currentEnemy.load(data.currentEnemy);
    }
}
