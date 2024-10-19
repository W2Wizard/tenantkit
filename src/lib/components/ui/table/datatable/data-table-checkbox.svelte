<script lang="ts">
import type { Writable } from "svelte/store";
import Checkbox from "../../checkbox/checkbox.svelte";

export let checked: Writable<boolean>;
</script>

<Checkbox bind:checked={$checked} />
