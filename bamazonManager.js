var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'bamazon'
});
 
//Used to ask the user what they want to do
var uQuestions = [{
	name: "uOption",
	message: "Select an option:",
	type: "list",
	choices: [
		"View products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"
	],
	filter: function (str){
		return str.toLowerCase();
	}}, 
	{
	name: "iD",
	message: "Enter the ID of the product you'd like to add to:",
	type: "input",
	when: function(answers)
	{
		return answers.uOption == "add to inventory";
	}
	}, 
	{
	name: "quantity",
	message: "How many would you like to add?",
	type: "input",
	when: function(answers)
	{
		return answers.uOption == "add to inventory";	
	}	
	},
	{
	name: "pName",
	message: "What's the name of the product?",
	type: "input",
	when: function(answers)
	{
		return answers.uOption == "add new product";
	}	
	},
	{
	name: "dName",
	message: "What's the name of the department?",
	type: "input",
	when: function(answers)
	{
		return answers.uOption == "add new product";
	}	
	},
	{
	name: "uPrice",
	message: "How much does the product cost?",
	type: "input",
	when: function(answers)
	{
		return answers.uOption == "add new product";
	}	
	},
	{
	name: "uQuantity",
	message: "How much of the product is in stock?",
	type: "input",
	when: function(answers)
	{
		return answers.uOption == "add new product";
	}	
	}
];

//Opens the connection to the database
connection.connect();

//Asks the user what they want to do
inquirer.prompt(uQuestions).then(function (answers) {
    //Processes the user's input

    //console.log(answers);
    //Displays all the items in the database
    if(answers.uOption == "view products for sale")
    {
    	displayData();
    }

    else if(answers.uOption == "view low inventory")
    {
    	viewLowInventory();
    }

    else if(answers.uOption == "add to inventory")
    {
    	addToInventory(answers);
    }

    else if(answers.uOption == "add new product")
    {
    	addNewProduct(answers);
    }
});

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
	});
	//Closes the connection to the database
	connection.end();
}

//Shows all items with stock less than 5
function viewLowInventory()
{
	connection.query("SELECT * FROM products", function(err, result, fields) {
		if (err) throw err;

		var anyLow = false;
		//Looks for the item the user wants in the database
		for(i = 0; i < result.length; i++)
		{
			//If the item ID the user inputed matches one in the database
			if(result[i].stock_quantity < 5)
			{
				if(anyLow == false)
				{
					console.log("Low Inventory Products:");
				}
				console.log("-------------------");
				console.log("Item ID: "+result[i].item_id);
				console.log("Product Name: "+result[i].product_name);
				console.log("Dept. Name: "+result[i].department_name);
				console.log("Price: $"+result[i].price);
				console.log("Stock Quantity: "+result[i].stock_quantity);
				anyLow = true;
			}
		}


		//If the item ID is invalid, say it's invalid
		if(!anyLow)
		{
			console.log("No Inventory Products Low");
		}

		//Closes the connection to the database
		connection.end();
	});	
}

//Adds more stock to an inventory item
function addToInventory(uInput)
{
	connection.query("SELECT * FROM products", function(err, result, fields) {
		if (err) throw err;
		var found = false;

		if(parseInt(uInput.quantity) > 0)
		{
			
			//Looks for the item the user wants in the database
			for(i = 0; i < result.length; i++)
			{
				//If the item ID the user inputed matches one in the database
				if(uInput.iD == result[i].item_id)
				{
					found = true;
					//For troubleshooting
					//console.log("Found");
					
					//Splits apart the command for easier reading
					var sqlAction = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
					//The amount the quantity is changing by
					var newInt = parseInt(uInput.quantity);
					var firstInt = parseInt(result[i].stock_quantity);
					var addedInt = firstInt + newInt;
					var updatedQuantity = addedInt;
					//Plugs in how much the stock quantity is changing by, and where it's being changed	
					connection.query(sqlAction,[updatedQuantity, result[i].item_id], function(err, result) {	
						if (err) throw err;
						console.log("Amount added!");
					});		
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


//Lets the user add a new item to the database
function addNewProduct(uInput)
{
	connection.query("SELECT * FROM products", function(err, result, fields) {
		if (err) throw err;

		var sqlAction = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?";
		var valueField = [[uInput.pName, uInput.dName, uInput.uPrice, uInput.uQuantity]];		

		//Adds the product to the database
		connection.query(sqlAction, [valueField], function(err, result) {	
					if (err) throw err;
					console.log("Product added!");
				});		

		//Closes the connection to the database
		connection.end();
	});

}