// ============================================================================
// W2Inc, Amsterdam 2023, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

interface BaseDialog {
	title: string;
	message: string;
}

interface ConfirmDialog extends BaseDialog {
	type: "confirm";
	resolve: (value: boolean) => void;
}

interface AlertDialog extends BaseDialog {
	type: "alert";
	resolve: () => void;
}

// Union type for different dialog types
type Dialog = ConfirmDialog | AlertDialog;
// Omit internal properties based on dialog type
export type ConfirmProps = Omit<ConfirmDialog, "resolve" | "type">;
export type AlertProps = Omit<AlertDialog, "resolve" | "type">;

// ============================================================================

class Dialogs {
	public current = $state<Dialog | null>(null);

	/**
	 * Create a confirmation dialog instance. User will be prompted with a yes or no.
	 * @param props Props to customize the dialog.
	 * @returns Promise that resolves to true if confirmed, false if cancelled.
	 */
	public confirm(props?: ConfirmProps) {
		return new Promise<boolean>((resolve) => {
			props = props ?? {
				title: "Are you sure?",
				message: "Are you sure you want to continue with this action?",
			};

			this.current = { ...props, type: "confirm", resolve };
		});
	}

	/**
	 * Create an alert dialog instance. User will be shown an alert message.
	 * @param props Props to customize the alert.
	 * @returns Promise that resolves when the alert is acknowledged.
	 */
	public alert(props?: AlertProps) {
		return new Promise<void>((resolve) => {
			props = props ?? {
				title: "Attention",
				message: "You cannot do that!",
			};

			this.current = { ...props, type: "alert", resolve };
		});
	}
}

// ============================================================================

/**
 * Custom dialog store instance, with a similar API to the browser's
 * `confirm` and `alert`
 */
export const dialog = new Dialogs();
