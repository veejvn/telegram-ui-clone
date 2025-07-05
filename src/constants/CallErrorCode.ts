export enum CallErrorCode {
    /** The user chose to end the call */
    UserHangup = "user_hangup",

    /** The local client failed to create an offer */
    LocalOfferFailed = "local_offer_failed",

    /** No local mic/camera available (denied or unplugged) */
    NoUserMedia = "no_user_media",

    /** Failed to send invite due to unknown devices */
    UnknownDevices = "unknown_devices",

    /** Failed to send invite for other reasons */
    SendInvite = "send_invite",

    /** Could not create an answer */
    CreateAnswer = "create_answer",

    /** Could not create an offer */
    CreateOffer = "create_offer",

    /** Failed to send the answer */
    SendAnswer = "send_answer",

    /** Failed to set remote session description */
    SetRemoteDescription = "set_remote_description",

    /** Failed to set local session description */
    SetLocalDescription = "set_local_description",

    /** Another device answered the call */
    AnsweredElsewhere = "answered_elsewhere",

    /** Could not establish media connection */
    IceFailed = "ice_failed",

    /** Call invite timed out */
    InviteTimeout = "invite_timeout",

    /** Call replaced by another */
    Replaced = "replaced",

    /** Signalling failed mid-call */
    SignallingFailed = "signalling_timeout",

    /** Remote party is busy */
    UserBusy = "user_busy",

    /** Call was transferred */
    Transferred = "transferred",

    /** New session from same user found */
    NewSession = "new_session"
}
