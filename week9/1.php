<?php
    $x = $_POST["x"] ?? "";
    $op = $_POST["op"] ?? "";
    
    $errors = [];
    if(filter_var($x, FILTER_VALIDATE_FLOAT) === false){
        $errors["x"] = "x must be a number";
    } 

    if ($op === ""){
        $errors["op"] = "No operator selected";
    } else if ($op !== 'square' && $op !== 'cube' && $op !== 'double'){
        $errors["op"] = "Invalid operator";
    }

    if (count($errors) === 0){
        if ($op === "double") {
            $res = 2 * $x;
        }

        if ($op === "square") {
            $res = $x * $x;
        }

        if ($op === "cube") {
            $res = $x * $x * $x;
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="1.php" method="POST">
        x = <input type="number" name="x" value="<?= $x; ?>">
        <?= $errors["x"] ?? "" ?>
        <br>
        <select name="op">
            <option value="double" <?= $op == "double" ? "selected" : "" ?>>Double</option>
            <option value="square" <?= $op == "square" ? "selected" : "" ?>>Square</option>
            <option value="cube" <?= $op == "cube" ? "selected" : "" ?>>Cube</option>
        </select>
        <?= $errors["op"] ?? "" ?>
        <br>
        Result: <?= $res ?? "Not yet" ?>
        <button type="submit">Send this form</button>
    </form>
</body>
</html>