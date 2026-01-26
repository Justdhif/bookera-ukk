<?php

foreach (glob(__DIR__ . '/*.php') as $file) {
    if (basename($file) !== 'helpers.php') {
        require_once $file;
    }
}
