<script lang="ts">
import { ModeWatcher } from "mode-watcher";

const { children } = $props();
</script>

<ModeWatcher />
<div class="h-dvh w-full lg:grid lg:grid-cols-2">
	<div id="body" class="flex items-center justify-center py-12">
		{@render children()}
	</div>
	<div id="image" class="hidden bg-muted lg:block">
		<img
			src="/placeholder.svg"
			alt="placeholder"
			width="1920"
			height="1080"
			class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
