<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$env = parse_ini_file('.env');
$openai_key = $env['OPENAI_API_KEY'] ?? null;

if (!$openai_key) {
    echo json_encode(['error' => 'Missing OpenAI key']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$source = trim($input['source'] ?? '');

if (!$source || strlen($source) < 50) {
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$hash = md5($source);
$cacheFile = 'analysis-cache.json';
$cache = file_exists($cacheFile) ? json_decode(file_get_contents($cacheFile), true) : [];

if (isset($cache[$hash])) {
    echo json_encode(['cached' => true] + $cache[$hash]);
    exit;
}

$prompt = "You are a security expert. Analyze this smart contract and return:\n\n".
    "1. Trust Score (0-100)\n2. Description\n3. Security Risks\n4. Red Flags\n\nCode:\n$source";

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $openai_key",
        "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "model" => "gpt-4",
        "messages" => [[ "role" => "user", "content" => $prompt ]],
        "temperature" => 0.3,
        "max_tokens" => 500
    ])
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    echo json_encode(['error' => 'OpenAI request failed']);
    exit;
}

$data = json_decode($response, true);
$text = trim($data['choices'][0]['message']['content'] ?? '');

preg_match('/(\d{1,3})\/?100/', $text, $m);
$score = isset($m[1]) ? intval($m[1]) : null;

$result = [
    'score' => $score,
    'analysis' => $text
];

$cache[$hash] = $result;
file_put_contents($cacheFile, json_encode($cache, JSON_PRETTY_PRINT));

echo json_encode($result);
