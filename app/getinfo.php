<?php

$config = include 'config.php';

$content = file_get_contents($config['api_url'].'/film/get_info/'.$_GET['id'].'/?api_key='.$config['api_key']);

header('Content-type: application/json; charset="utf-8"');
echo $_GET['callback'].'('.$content.');';