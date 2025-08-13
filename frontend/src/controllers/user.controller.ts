import Router from "../router";

export class UserController {
	private static instance: UserController;
	private router: Router;

	private constructor(router: Router) {
		this.router = router;
	}

	public static getInstance(router?: Router): UserController {
		if (!UserController.instance && router) {
			UserController.instance = new UserController(router);
		}
		return UserController.instance;
	}

	public navigateToUser(url: string) {
        this.router.navigateTo(url);
    }
}
