<?php 
    $name = $_GET["name"] ?? "";

    $pdo = new PDO("sqlite:database.sqlite");
    $stmt = $pdo -> prepare("SELECT * FROM people WHERE LIKE = :name");
    $stmt -> execute(["name" => "%$name%"]);
    $result = $stmt -> fetchAll();
    
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form action="index.php" method="GET">
        <input type="name" name="name">
        <button>Search by name</button>
    </form>
    <table>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
        </tr>
        <?php foreach($result as $r): ?>
        <tr>
            <td><?= $r["id"] ?></td>
            <td><?= $r["name"] ?></td>
            <td><?= $r["age"] ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>