<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>This is <?php
        echo 6 + 7;
    ?> pure HTML</h1>
    <?php
        $x = 5;
        echo $x;
        echo "<br>";    
        echo($x);
        print $x;
        print($x);

        $a = [5, 7, 8, 0, 4];
        for ($i = 0; $i < count($a); $i++)
            echo $a[$i];
        echo "<br>";
        foreach($a as $b) // python: for b in a
                echo $b;
        echo "<br>";
        //best way to write array:
        echo implode("," , $a);
        echo "<br>";

        $car = [
            "model" => "Tesla Model M",
            "year" => 2024,
            "broken" => false //false => "", true => 1
        ];

        foreach($car as $key => $value) {
            //echo $key . " is " . $value . "<br>";;
            echo "$key is $value<br>"; // ("");
        }

        function add($a, $b){
            return $a + $b;
        }
        echo add(12.3, 4)
    ?>
</body>
</html>