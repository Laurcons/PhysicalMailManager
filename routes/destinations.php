<?php

use PMailApi\Database;
use Pecee\SimpleRouter\SimpleRouter;

SimpleRouter::get("/destinations", function() {
    $dests = Database::destinations()->findBy(
        ["userId", "=", request()->userId]
    );
    response()->json([
        "status" => "success",
        "data" => $dests
    ]);
});

SimpleRouter::post("/destination", function() {
    $values = [
        "name", "postalCode", "street", "number",
        "block", "stair", "apartment",
        "locality", "commune", "county", "observations"
    ];
    $dest = [
        "userId" => request()->userId
    ];
    foreach ($values as $value) {
        $dest[$value] = input($value, "");
    }
    $dest = Database::destinations()->insert(
        $dest
    );
    response()->json([
        "status" => "success",
        "data" => $dest
    ]);
});

SimpleRouter::patch("/destination/{id}", function($destId) {
    // find destination
    $dest = Database::destinations()->findById($destId);
    if (!isset($dest) || 
        (isset($dest) && $dest["userId"] !== request()->userId)
    ) {
        response()->httpCode(404)->json([
            "status" => "destination-not-found"
        ]);
    }
    $values = [
        "name", "postalCode", "street", "number",
        "block", "stair", "apartment",
        "locality", "commune", "county", "observations"
    ];
    $before = $dest;
    foreach ($values as $val) {
        if (array_key_exists($val, $_POST))
            $dest[$val] = $_POST[$val];
    }
    Database::destinations()->update($dest);
    response()->json([
        "status" => "success",
        "data" => $dest
    ]);
});

SimpleRouter::get("/destination/{id}", function($destId) {
    $dest = Database::destinations()->findById($destId);
    if ($dest["userId"] !== request()->userId) {
        $dest = null;
    }
    if ($dest === null)
        response()->httpCode(404);
    response()->json([
        "status" => $dest !== null ? "success" : "not-found",
        "data" => $dest
    ]);
});

SimpleRouter::delete("/destination/{id}", function($destId) {
    $dest = Database::destinations()->findById($destId);
    if ($dest["userId"] !== request()->userId) {
        $dest = null;
    }
    if ($dest === null) {
        response()->httpCode(404)->json([
            "status" => "not-found"
        ]);
    }
    Database::destinations()->deleteById($dest["_id"]);
    response()->json([
        "status" => "success"
    ]);
});
