<?php
// TODO: 実際の受信用メールアドレスに差し替えてください
$to = 'contact@hotto-yoga.example';

$name     = isset($_POST['name'])     ? mb_convert_encoding(trim($_POST['name']), 'UTF-8', 'auto')     : '';
$email    = isset($_POST['email'])    ? trim($_POST['email'])    : '';
$category = isset($_POST['category']) ? mb_convert_encoding(trim($_POST['category']), 'UTF-8', 'auto') : '';
$message  = isset($_POST['message'])  ? mb_convert_encoding(trim($_POST['message']), 'UTF-8', 'auto')  : '';

if (empty($name) || empty($email) || empty($message)) {
    header('Location: index.html#contact');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: index.html#contact');
    exit;
}

$subject = '【ほっとヨガ教室】お問い合わせ：' . $category;

$body  = "お名前：{$name}\n";
$body .= "メールアドレス：{$email}\n";
$body .= "ご希望の内容：{$category}\n";
$body .= "\n";
$body .= "メッセージ：\n{$message}\n";

$headers  = "From: {$name} <{$email}>\r\n";
$headers .= "Reply-To: {$email}\r\n";

mb_language('Japanese');
mb_internal_encoding('UTF-8');

$result = mb_send_mail($to, $subject, $body, $headers);

if ($result) {
    header('Location: thanks.html');
} else {
    header('Location: index.html#contact');
}
exit;
?>
