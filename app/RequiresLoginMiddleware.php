<?php

namespace PMailApi\Middlewares;

use Pecee\Http\Middleware\IMiddleware;
use Pecee\Http\Request;

class RequiresLoginMiddleware implements IMiddleware {

    public function handle(Request $req): void {

        if ($req->user === null) {
            response()->httpCode(403);
            response()->json([
                "status" => "access-denied",
                "reason" => "not-logged-in"
            ]);
            return;
        }

        $req->userId = $req->user["_id"];

    }

}