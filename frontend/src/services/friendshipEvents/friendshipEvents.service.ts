export class FriendshipEventsService {
    private static instance: FriendshipEventsService;

    private constructor() {}

    static getInstance(): FriendshipEventsService {
        if (!FriendshipEventsService.instance) {
            FriendshipEventsService.instance = new FriendshipEventsService();
        }
        return FriendshipEventsService.instance;
    }

    notifyFriendRequestSent() {
        window.dispatchEvent(new CustomEvent("friendRequestUpdated"));
    }

    notifyFriendRequestAccepted() {
        window.dispatchEvent(new CustomEvent("friendRequestUpdated"));
        window.dispatchEvent(new CustomEvent("friendshipChanged"));
    }

    notifyFriendRequestDeclined() {
        window.dispatchEvent(new CustomEvent("friendRequestUpdated"));
    }
}
