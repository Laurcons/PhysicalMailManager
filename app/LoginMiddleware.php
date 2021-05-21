<?php

namespace PMailApi\Middlewares;

use Pecee\Http\Middleware\IMiddleware;
use Pecee\Http\Request;

class LoginMiddleware implements IMiddleware {

    public function handle(Request $req): void {

        $req->user = $_SESSION["user"] ?? null;

    }

}