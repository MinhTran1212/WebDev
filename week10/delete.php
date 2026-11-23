<?php
    $pdo = new PDO("sqlite:" . __DIR__ . "/database.sqlite");
    $message = "";
    $error = "";

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $id = $_POST["id"] ?? "";

        if (filter_var($id, FILTER_VALIDATE_INT) === false || (int) $id < 1) {
            $error = "Invalid person ID.";
        } else {
            $stmt = $pdo->prepare("DELETE FROM people WHERE id = :id");
            $stmt->execute(["id" => (int) $id]);
            $message = $stmt->rowCount() > 0
                ? "Person deleted."
                : "No person found with that ID.";
        }
    }

    $stmt = $pdo->query("SELECT id, name, age FROM people ORDER BY id");
    $people = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete person</title>
</head>
<body>
    <h1>Delete a person</h1>

    <?php if ($error !== ""): ?>
        <p><?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?></p>
    <?php endif; ?>
    <?php if ($message !== ""): ?>
        <p><?= htmlspecialchars($message, ENT_QUOTES, "UTF-8") ?></p>
    <?php endif; ?>

    <table>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Action</th>
        </tr>
        <?php foreach ($people as $person): ?>
            <tr>
                <td><?= (int) $person["id"] ?></td>
                <td><?= htmlspecialchars($person["name"], ENT_QUOTES, "UTF-8") ?></td>
                <td><?= (int) $person["age"] ?></td>
                <td>
                    <form action="delete.php" method="POST" onsubmit="return confirm('Delete this person?');">
                        <input type="hidden" name="id" value="<?= (int) $person["id"] ?>">
                        <button type="submit">Delete</button>
                    </form>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>

    <p><a href="index.php">Back to people list</a></p>
</body>
</html>
