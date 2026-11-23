<?php
    $pdo = new PDO("sqlite:" . __DIR__ . "/database.sqlite");
    $message = "";
    $error = "";
    $person = null;
    $id = $_GET["id"] ?? $_POST["id"] ?? "";

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $name = trim($_POST["name"] ?? "");
        $age = $_POST["age"] ?? "";

        if (filter_var($id, FILTER_VALIDATE_INT) === false || (int) $id < 1) {
            $error = "Enter a valid ID.";
        } elseif ($name === "" || $age === "" || filter_var($age, FILTER_VALIDATE_INT) === false || (int) $age < 0) {
            $error = "Enter a name and a valid age.";
        } else {
            $stmt = $pdo->prepare("UPDATE people SET name = :name, age = :age WHERE id = :id");
            $stmt->execute([
                "name" => $name,
                "age" => (int) $age,
                "id" => (int) $id,
            ]);

            if ($stmt->rowCount() > 0) {
                $message = "Person updated.";
            } else {
                $check = $pdo->prepare("SELECT id FROM people WHERE id = :id");
                $check->execute(["id" => (int) $id]);
                $message = $check->fetch() ? "No changes were made." : "No person found with that ID.";
            }
        }
    }

    if ($id !== "" && filter_var($id, FILTER_VALIDATE_INT) !== false && (int) $id > 0) {
        $stmt = $pdo->prepare("SELECT id, name, age FROM people WHERE id = :id");
        $stmt->execute(["id" => (int) $id]);
        $person = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$person && $error === "") {
            $error = "No person found with that ID.";
        }
    } elseif ($id !== "" && $error === "") {
        $error = "Enter a valid ID.";
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update person</title>
</head>
<body>
    <h1>Update a person</h1>
    <form action="update.php" method="GET">
        <label for="id">Person ID:</label>
        <input type="number" id="id" name="id" min="1" value="<?= htmlspecialchars((string) $id, ENT_QUOTES, "UTF-8") ?>" required>
        <button type="submit">Find person</button>
    </form>

    <?php if ($error !== ""): ?>
        <p><?= htmlspecialchars($error, ENT_QUOTES, "UTF-8") ?></p>
    <?php endif; ?>
    <?php if ($message !== ""): ?>
        <p><?= htmlspecialchars($message, ENT_QUOTES, "UTF-8") ?></p>
    <?php endif; ?>

    <?php if ($person): ?>
        <form action="update.php" method="POST">
            <input type="hidden" name="id" value="<?= (int) $person["id"] ?>">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="<?= htmlspecialchars($person["name"], ENT_QUOTES, "UTF-8") ?>" required><br>
            <label for="age">Age:</label>
            <input type="number" id="age" name="age" min="0" value="<?= (int) $person["age"] ?>" required><br>
            <button type="submit">Save changes</button>
        </form>
    <?php endif; ?>

    <p><a href="index.php">Back to people list</a></p>
</body>
</html>
