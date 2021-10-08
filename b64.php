<?php
add_header Allow "GET, POST, HEAD" always;
if ( $request_method !~ ^(GET|POST|HEAD)$ ) {
	return 405;
}
$url = $_POST['imgurl'];
$vkresult = file_get_contents($url, false, stream_context_create(array(
    'http' => array(
        'method'  => 'GET',
        'header'  => 'Content-type: application/x-www-form-urlencoded'
    )
)));
$b64img = base64_encode($vkresult);
exit($b64img);
?>
