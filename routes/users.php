<?php

use Pecee\SimpleRouter\SimpleRouter;
use PMailApi\Database;
use PMailApi\Middlewares\RequiresLoginMiddleware;

$DEFAULT_PREFERENCES = [
    "darkMode" => "default",
    "entriesPerPage" => 10,
    "viewIds" => false,
];

SimpleRouter::post("/login", function() use($DEFAULT_PREFERENCES) {

    // find user
    $user = Database::users()->findOneBy(
        ["username", "=", input("username", "")]
    );

    if ($user === null) {
        response()->httpCode(400);
        response()->json([
            "status" => "user-not-found"
        ]);
        return;
    }

    // check password
    if (!password_verify(input("password", ""), $user["password"])) {
        response()->httpCode(400);
        response()->json([
            "status" => "password-invalid"
        ]);
        return;
    }

    // attach preferences
    foreach ($DEFAULT_PREFERENCES as $pref => $val) {
        if (array_key_exists($pref, $user)) {
            // do nothing
        } else {
            $user["preferences"][$pref] = $val;
        }
    }

    // do login!
    $user["loginTimestamp"] = time();
    $_SESSION["user"] = $user;
    Database::users()->update($user);

    response()->json([
        "status" => "success"
    ]);

});

SimpleRouter::post("/register", function() {

    $requiredFields = [
        "username", "password"
    ];
    foreach ($requiredFields as $f) {
        if (input($f, null) === null) {
            response()->httpCode(400)->json([
                "status" => "missing-fields",
                "required" => $requiredFields
            ]);
        }
    }
    // check username uniqueness
    $user = Database::users()->findOneBy(
        ["username", "=", input("username")]
    );
    if ($user !== null) {
        response()->httpCode(400)->json([
            "status" => "username-not-unique"
        ]);
    }

    $user = [
        "username" => input("username"),
        "password" => password_hash(input("password"), PASSWORD_DEFAULT),
        "registerTimestamp" => time(),
        "loginTimestamp" => time()
    ];
    Database::users()->insert($user);
    response()->json([
        "status" => "success"
    ]);

});

SimpleRouter::group(["middleware" => RequiresLoginMiddleware::class], function() use($DEFAULT_PREFERENCES) {

    SimpleRouter::get("/user", function() {

        response()->json([
            "status" => "success",
            "data" => request()->user
        ]);

    });

    SimpleRouter::post("/logout", function() {

        $_SESSION["user"] = null;
        response()->json([
            "status" => "success"
        ]);

    });

    SimpleRouter::post("/user/preferences", function() use($DEFAULT_PREFERENCES) {

        $user = request()->user;
        foreach ($DEFAULT_PREFERENCES as $pref => $defVal) {
            if (array_key_exists($pref, $_POST)) {
                $user["preferences"][$pref] = input($pref, null, "post");
            }
        }
        Database::users()->update($user);
        $_SESSION["user"] = $user;
        response()->json([
            "status" => "success",
            "preferences" => $user["preferences"]
        ]);

    });

});