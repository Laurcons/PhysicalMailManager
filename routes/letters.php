<?php

use PMailApi\Database;
use Pecee\SimpleRouter\SimpleRouter;

SimpleRouter::get("/letters", function() {
    // get all letters of current user
    $filterableParams = [
        "type", "destinationId", "handwritten", "receivedDate", "writtenDate", "sentDate"
    ];
    $allFilter = input("all", null, "get");
    $resultFilters = array_fill_keys($filterableParams, null);
    $lets = Database::letters()->findBy(
        array_merge([
            ["userId", "=", request()->userId]
        ], array_map(function($filter) use ($allFilter, &$resultFilters) {
            // return filter arrays for the db function findBy, then merge them
            $v = ($allFilter !== null) ? $allFilter : input($filter);
            $resultFilters[$filter] = $v;
            return [$filter, "LIKE", "%" . $v . "%"];
        }, array_filter($filterableParams, function($filter) use($allFilter) {
            // return only non-null filter params
            return $allFilter !== null || input($filter, null, "get") !== null;
        }))),
        ["timestamp" => "desc", "_id" => "desc"]
    );
    response()->json([
        "status" => "success",
        "letters" => $lets,
        "filters" => $resultFilters
    ]);
});

SimpleRouter::post("/letter", function() {
    $requiredFields = [
        "destinationId",
        "type"
    ];
    $optionalFields = [
        "code",
        "price",
        "handwritten",
        "receivedDate",
        "observations",
        "writtenDate",
        "sentDate"
    ];
    $let = [];
    foreach ($requiredFields as $f) {
        $v = input($f, null, "post");
        if ($f === "destinationId")
            $v = intval($v);
        if ($v === null) {
            response()->httpCode(400)->json([
                "status" => "missing-parameters",
                "required" => $requiredFields
            ]);
        }
        $let[$f] = $v;
    }
    foreach ($optionalFields as $f) {
        $v = input($f, "", "post");
        $let[$f] = $v;
    }

    // check if destinationId is ok
    $dest = Database::destinations()->findById(input("destinationId"));
    // check if it's the user's dest
    if (($dest["userId"] ?? "") !== request()->userId)
        $dest = null;
    if ($dest === null) {
        response()->httpCode(404)->json([
            "status" => "destination-not-found",
        ]);
    }

    // check if type is ok
    $allowedTypes = ["outgoing", "incoming"];
    if (array_search(input("type"), $allowedTypes) === FALSE) {
        response()->httpCode(400)->json([
            "status" => "type-invalid",
            "allowedTypes" => $allowedTypes
        ]);
    }

    // attach current user and add to db
    $let["userId"] = request()->userId;
    $let["timestamp"] = time();
    $let = Database::letters()->insert($let);
    response()->json([
        "status" => "success",
        "letter" => $let
    ]);
});

SimpleRouter::get("/letter/{id}", function($letId) {
    // try retrieve id
    $let = Database::letters()->findById($letId);
    // check user ownership
    if (($let["userId"] ?? "") !== request()->userId)
        $let = null;
    if ($let === null) {
        response()->httpCode(404)->json([
            "status" => "not-found"
        ]);
    }
    // all's good
    response()->json([
        "status" => "success",
        "letter" => $let
    ]);
});

SimpleRouter::patch("/letter/{id}", function($letId) {
    // try retrieve it and check user ownership
    $let = Database::letters()->findById($letId);
    if (($let["userId"] ?? "") !== request()->userId)
        $let = null;
    if ($let === null) {
        response()->httpCode(404)->json([
            "status" => "not-found"
        ]);
    }
    // go thru all values and update if needed
    array_walk($let, function(&$val, $key) {
        if ($key === "_id")
            return;
        if ($key === "destinationId")
            $val = intval(input("destinationId", $val, "post"));
        if (array_search($key, ["userId", "_id", "userId"]) !== FALSE)
            return;
        if (isset($_POST[$key]))
            $val = $_POST[$key];
    });
    // update it
    Database::letters()->update($let);
    // send response
    response()->json([
        "status" => "success",
        "letter" => $let
    ]);
});

SimpleRouter::delete("/letter/{id}", function($letId) {
    // try retrieve it and check user ownership
    $let = Database::letters()->findById($letId);
    if (($let["userId"] ?? "") !== request()->userId)
        $let = null;
    if ($let === null) {
        response()->httpCode(404)->json([
            "status" => "not-found"
        ]);
    }
    // delete it
    Database::letters()->deleteById($let["_id"]);
    // send response
    response()->json([
        "status" => "success",
        "letter" => $let
    ]);
});