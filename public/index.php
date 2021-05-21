<?php

require_once("../vendor/autoload.php");

use \Pecee\SimpleRouter\SimpleRouter;
use \PMailApi\Database;
use Pecee\Http\Request;
use Pecee\SimpleRouter\Exceptions\NotFoundHttpException;
use PMailApi\Middlewares\CorsMiddleware;
use PMailApi\Middlewares\LoginMiddleware;
use PMailApi\Middlewares\RequiresLoginMiddleware;

require_once("../app/database.php");
require_once("../app/helper.php");
require_once("../app/LoginMiddleware.php");
require_once("../app/RequiresLoginMiddleware.php");
require_once("../app/CorsMiddleware.php");

SimpleRouter::group(["prefix" => "/api", "middleware" => [LoginMiddleware::class, CorsMiddleware::class]], function() {
    
    require("../routes/hello.php");
    require("../routes/users.php");

    SimpleRouter::group(["middleware" => RequiresLoginMiddleware::class], function() {

        require("../routes/destinations.php");
        require("../routes/letters.php");

    });

});

SimpleRouter::error(function(Request $request, \Exception $exception) {

    if($exception instanceof NotFoundHttpException || $exception->getCode() === 404) {
        response()->httpCode(404)->json([
            "status" => "route-not-found",
            "url" => url()
        ]);
    } else {
        response()->httpCode(500)->json([
            "status" => "internal-server-error"
        ]);
    }
    
});

session_start();
Database::init();
$dbg = SimpleRouter::start();


?>