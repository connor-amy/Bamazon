var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'bamazon'
});
 
//Used to ask the user what they want to buy
var uQuestions = [{
	name: "iD",
	message: "Enter the ID of the item you'd like to purchase!"
}, {
	name: "quantity",
	message: "How many would you like to buy?"
}];

//Opens the connection to the database
connection.connect();

//Displays everything in the database's table and asks the user what to buy
displayData();

//Displays the data in the database
function displayData()
{
	connection.query("SELECT * FROM products", function(err, result, fields) {
		if (err) throw err;
		//console.log("| Item ID | Product Name | Dept. Name | Price | Stock Quantity |")
		for(i = 0; i < result.length; i++)
		{
			console.log("-------------------");
			console.log("Item ID: "+result[i].item_id);
			console.log("Product Name: "+result[i].product_name);
			console.log("Dept. Name: "+result[i].department_name);
			console.log("Price: $"+result[i].price);
			console.log("Stock Quantity: "+result[i].stock_quantity);
			

		}
		//Asks what the user would like to buy
		askQ();
	});

}

//Takes the user's answeres and checks if what they want is possible
function processItem(uInput)
{
	connection.query("SELECT * FROM products", function(err, result, fields) {
		if (err) throw err;

		var found = false;
		//Looks for the item the user wants in the database

		if(parseInt(uInput.quantity) > 0)
		{

			for(i = 0; i < result.length; i++)
			{
				//If the item ID the user inputed matches one in the database
				if(uInput.iD == result[i].item_id)
				{
					found = true;
					//For troubleshooting
					//console.log("Found");

					//Changes the user input to an int so it can be compared
					if(result[i].stock_quantity >= parseInt(uInput.quantity))
					{
						var cost = parseInt(uInput.quantity)*result[i].price;
						var cost = cost.toFixed(2);
						//Splits apart the command for easier reading
						var sqlAction = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
						//The amount the quantity is changing by
						var updatedQuantity = result[i].stock_quantity-=parseInt(uInput.quantity);
						//Plugs in how much the stock quantity is changing by, and where it's being changed	
						connection.query(sqlAction,[updatedQuantity, result[i].item_id], function(err, result) {	
							if (err) throw err;
							console.log("Purchase Successful!");
							console.log("The total cost of your purchase is: $"+cost);
						});
					}

					//If there weren't enough items in stock
					else
					{
						console.log("There are not enough items to make that purchase!");
					}

				}
			}
		}

		//If the item ID is invalid, say it's invalid
		if(!found)
		{
			console.log("That's not an option!");
		}

		//Closes the connection to the database
		connection.end();
	});

}

//Asks the user what they want to buy and how much
function askQ()
{
	inquirer.prompt(uQuestions).then(function (answers) {
    //Processes the user's input
    processItem(answers);
   
	});

}