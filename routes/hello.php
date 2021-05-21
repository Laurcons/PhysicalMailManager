<?php

use \Pecee\Http\Response;
use \Pecee\Http\Request;
use \Pecee\SimpleRouter\SimpleRouter;
use \Database\Database;


SimpleRouter::group(["prefix" => "/hello"], function() {
    SimpleRouter::get("/", function() {
        response()->json([
            "hello" => "hi"
        ]);
    });
});