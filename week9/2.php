<?php
    $name = $_POST["name"] ?? "";
    $age = $_POST["age"] ?? "";
    $email = $_POST["email"] ?? "";
    $checkbox = $_POST["checkbox"] ?? "";
    $date = $_POST["date"] ?? "";
    $errors = [];

    if ($_POST) {
        if (trim($name) == "") {
            $errors["name"] = "Name must not be empty.";
        } elseif (str_word_count($name) != 2) {
            $errors["name"] = "Name must contain exactly two words.";
        }
    }

    if ($_POST) {
        if (trim($age) === "") {
            $errors["age"] = "age cannot be empty";
        } else if (filter_var($age, FILTER_VALIDATE_INT) === false) {
            $errors["age"] = "age must be an integer";
        } else if ($age > 99 || $age < 0) {
            $errors["age"] = "age must be between 0 and 99";
        }

        if (trim($email) === "") {
            $errors["email"] = "email cannot be empty";
        } else if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors["email"] = "email must be in email format";
        }

        if ($checkbox === "") {
            $errors["checkbox"] = "checkbox must be checked";
        }

        if (trim($date) === "") {
            $errors["date"] = "date cannot be empty";
        } else if ($date >= date("Y-m-d")) {
            $errors["date"] = "date must be before today";
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
    <form action="2.php" method="POST" novalidate>
        Name: <input type="text" name="name" value="<?= htmlspecialchars($name) ?>">
        <?= $errors["name"] ?? "" ?>
        <br>
        <!-- must not be empty, must have 2 words -->

        Age: <input type="text" name="age" value="<?= htmlspecialchars($age) ?>">
        <?= $errors["age"] ?? "" ?><br>
        <!-- must not be empty, must be integer, must be 0-99 -->

        Email <input type="text" name="email" value="<?= htmlspecialchars($email) ?>">
        <?= $errors["email"] ?? "" ?><br>
        <!-- must not be empty, must be email format -->

        Checkbox: <input type="checkbox" name="checkbox" <?= $checkbox !== "" ? "checked" : "" ?>>
        <?= $errors["checkbox"] ?? "" ?><br>
        <!-- must be checked -->

        Date: <input type="date" name="date" value="<?= htmlspecialchars($date) ?>">
        <?= $errors["date"] ?? "" ?><br>
        <!-- must be before today -->

        <button type="submit">Submit</button>

    </form>
    <!-- show errors messages next to the field and write the data back to the field -->
</body>
</html>