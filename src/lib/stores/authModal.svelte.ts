type View = 'signup' | 'login';

let open = $state(false);
let initialView = $state<View>('signup');

export const authModal = {
	get open() {
		return open;
	},
	get initialView() {
		return initialView;
	},
	show(view: View) {
		initialView = view;
		open = true;
	},
	close() {
		open = false;
	}
};
