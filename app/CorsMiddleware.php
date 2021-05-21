<?php

namespace PMailApi\Middlewares;

use Pecee\Http\Middleware\IMiddleware;
use Pecee\Http\Request;

class CorsMiddleware implements IMiddleware {

    public function handle(Request $req): void {

        // pass through allowed origins
        $allowedOrigins = [
            "http://localhost",
            "https://pmail.laurcons.ro"
        ];
        $allowed = false;
        foreach ($allowedOrigins as $or) {
            if (strpos($req->getHeader("Origin"), $or) !== FALSE)
                $allowed = true;
        }
        if ($allowed) {
            // send CORS allowable headers
            response()
            ->header("Access-Control-Allow-Credentials: true")
            ->header("Access-Control-Allow-Methods: ".$req->getHeader("Access-Control-Request-Method", $req->getMethod()))
            ->header("Access-Control-Allow-Origin: ".$req->getHeader("Origin"))
            ->header("Access-Control-Allow-Headers: *")
            ->header("Access-Control-Max-Age: 86400");
        }

    }

}