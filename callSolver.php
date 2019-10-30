<?php
error_reporting(E_ERROR | E_PARSE);

$myObj = null;
$solver = null;

$myObj->arguments = $_POST['arguments'];
$myObj->attacks = $_POST['attacks'];
$myObj->semantics = $_POST['semantics'];

if($_POST['solver'] == "ArgTech"){
	$solver = "http://ws.arg.tech/e/dom";
}else{
	$solver = "http://cicero.cs.cf.ac.uk/jArgSemSATWeb/restapi/argtech/";
}
$data = json_encode($myObj);
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL,$solver);
curl_setopt($ch, CURLOPT_PROXY, '10.0.2.200:3128');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

curl_setopt($ch, CURLOPT_HTTPHEADER, array(
	'Content-Type: application/json'));
// receive server response ...
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$server_output = curl_exec ($ch);

if(curl_error($ch)){
	print(curl_error($ch));
}else{
	print($server_output);
}

curl_close ($ch);

// Prueba
//$obj->stable=[["1","2","3"],["3","4"],["6","5"]];
//$obj->arguments=["1","2","3","4","5","6"];
//$obj->attacks=["1","2","3"];

//print(json_encode($obj));


?> 
