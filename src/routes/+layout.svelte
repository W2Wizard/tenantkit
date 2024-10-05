<script lang="ts">
	import "../app.css";
	import { mode, ModeWatcher } from "mode-watcher";
	import { Toaster } from "svelte-sonner";
	const { children } = $props();
</script>

<ModeWatcher />
<Toaster theme={$mode} />
{@render children()}
