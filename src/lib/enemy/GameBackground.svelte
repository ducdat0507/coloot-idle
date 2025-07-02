<script lang="ts">
    import type Arena from "./arena";

    export let arena: Arena;

    $: stageData = arena.stageData;
</script>

<img
    class="bg fixed left-0 top-0 -z-10 h-screen w-full object-cover blur-xl brightness-[0.6]"
    style={`--tw-hue-rotate: hue-rotate(${stageData.isekai * 51}deg)`}
    src={stageData.background}
    alt="Background"
/>
