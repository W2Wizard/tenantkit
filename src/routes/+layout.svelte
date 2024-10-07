<script lang="ts">
import "../app.css";
import { mode, ModeWatcher } from "mode-watcher";
import { Toaster } from "svelte-sonner";
const { children } = $props();
</script>

<ModeWatcher />
<Toaster theme={$mode} duration={8000} />
{@render children()}
