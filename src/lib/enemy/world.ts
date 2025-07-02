import { I } from "../images";

export interface WorldData {
    stage: number;
    title: string;
    background: string;
}

export interface WorldAndIsekaiData {
    isekai: number;
    stage: number;
    title: string;
    background: string;
}

export const WORLD: WorldData[] = [
    {
        stage: 0,
        title: "Plains",
        background: I.backgrounds.plains,
    },
    {
        stage: 20,
        title: "Forest",
        background: I.backgrounds.forest,
    },
    {
        stage: 40,
        title: "Jungle",
        background: I.backgrounds.jungle,
    },
    {
        stage: 60,
        title: "Desert",
        background: I.backgrounds.desert,
    },
    {
        stage: 80,
        title: "Badlands",
        background: I.backgrounds.badlands,
    },
    {
        stage: 100,
        title: "Cave",
        background: I.backgrounds.cave,
    },
    {
        stage: 125,
        title: "Castle",
        background: I.backgrounds.castle,
    },
    {
        stage: 150,
        title: "Deep Dungeon",
        background: I.backgrounds.deepDungeon,
    },
    {
        stage: 175,
        title: "Hellscape",
        background: I.backgrounds.hellscape,
    },
    {
        stage: 200,
        title: "Portal to Another World",
        background: I.backgrounds.portal,
    },
    {
        stage: Infinity,
        title: "",
        background: "",
    },
];

export const ISEKAI_BASE = 225;
export const ISEKAI_STAGE_INCREASE = 10;
export const ISEKAI_INCREASE = ISEKAI_STAGE_INCREASE * (WORLD.length - 1);

export function getIsekaiForStage(stage: number): number {
    const b = ISEKAI_BASE;
    const i = ISEKAI_INCREASE;
    return Math.floor(
        (-(b - i / 2) + Math.sqrt((b - i / 2) ** 2 + 2 * i * stage)) / i,
    );
}
export function getStageForIsekai(isekai: number): number {
    const b = ISEKAI_BASE;
    const i = ISEKAI_INCREASE;
    return (b - i / 2) * isekai + (i / 2) * isekai * isekai;
}

export function getWorldDataForStage(stage: number): WorldAndIsekaiData {
    const isekai = getIsekaiForStage(stage);
    const isekaiStart = getStageForIsekai(isekai);
    const index = Math.max(
        WORLD.findLastIndex((data, index) => {
            return (
                stage >=
                data.stage +
                    isekaiStart +
                    isekai * index * ISEKAI_STAGE_INCREASE
            );
        }),
        0,
    );
    return {
        isekai,
        stage:
            WORLD[index].stage +
            isekaiStart +
            isekai * index * ISEKAI_STAGE_INCREASE,
        title: WORLD[index].title,
        background: WORLD[index].background,
    };
}
