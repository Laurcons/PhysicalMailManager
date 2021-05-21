<?php

namespace PMailApi;
use \SleekDB\Store;

require_once("../vendor/autoload.php");

class Database {
    /**
     * @var Store
     */
    private static $destinationsStore;
    /**
     * @var Store
     */
    private static $usersStore;
    /**
     * @var Store
     */
    private static $lettersStore;

    public static function init() {
        $dbPath = __DIR__ . "/../db";
        self::$destinationsStore = new Store("destinations", $dbPath);
        self::$usersStore = new Store("users", $dbPath);
        self::$lettersStore = new Store("letters", $dbPath);
    }

    public static function destinations(): Store {
        return self::$destinationsStore;
    }

    public static function users(): Store {
        return self::$usersStore;
    }

    public static function letters(): Store {
        return self::$lettersStore;
    }
}