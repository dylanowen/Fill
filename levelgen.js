//Level data
var level_height;
var level_width;
var layout;
const MIN_DIM = 3;
const MAX_DIM = 8;

//Movement data
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

//Random controller
var rng;

//Generate a random level given a seed
//The seed ensures that we can generate the same random levels each time
//Returns a Level object
//TODO: handle wrapping squares
function generateLevel(seed)
{
	//Init random number generator using David Bau's seedrandom
	rng = new Math.seedrandom(seed);
	
	//Init basic level info
	level_height = randToRangeInt(rng.quick(), MIN_DIM, MAX_DIM);
	level_width = randToRangeInt(rng.quick(), MIN_DIM, MAX_DIM);
	var start_row = randToRangeInt(rng.quick(), 0, level_height);
	var start_col = randToRangeInt(rng.quick(), 0, level_width);
	var min_steps = Math.floor(0.75 * (level_height * level_width));
	var max_steps = level_height * level_width;
	var num_steps = randToRangeInt(rng.quick(), min_steps, max_steps);
	
	//Generate empty board
	layout = [];
	for(i = 0; i < level_height; ++i)
	{
		var row = [];
		for(j = 0; j < level_width; ++j)
		{
			row.push(UNUSED);
		}
		layout.push(row);
	}
	
	//Set up path variable
	var path = [];
	path.push({row: start_row, col: start_col});
	
	//Init start square
	layout[start_row][start_col] = START;
	var current_pos = {row: start_row, col: start_col};
	
	//Start generating moves
	var step_count = 0;
	var available_directions = [UP, DOWN, LEFT, RIGHT];
	while(step_count < num_steps)
	{
		//Check if we're stuck
		if(available_directions.length == 0)
		{
			break;
		}
		
		//Choose a new move
		var next_pos;
		var index_chosen = randToRangeInt(rng.quick(), 0, available_directions.length);
		var direction = available_directions[index_chosen];
		next_pos = getPositionInDirection(current_pos, direction);
		if(!isValidSquare(next_pos)) //if not a valid move...
		{
			//Remove direction from available directions list
			available_directions.splice(index_chosen, 1);
			continue; //try again
		}
		
		console.log(direction); //strictly for cheating purposes
		
		//Reset valid directions
		available_directions = [UP, DOWN, LEFT, RIGHT];
		
		//Update layout
		if(layout[next_pos.row][next_pos.col] == UNUSED)
		{
			layout[next_pos.row][next_pos.col] = EMPTY;
		}
		else if(layout[next_pos.row][next_pos.col] == EMPTY)
		{
			layout[next_pos.row][next_pos.col] = HOLE;
		}
		else
		{
			alert('Layout error'); //debug
		}
		
		//Update position
		current_pos.row = next_pos.row;
		current_pos.col = next_pos.col;
		path.push({row: current_pos.row, col: current_pos.col});
		
		++step_count;
	} //while loop
	
	console.log(path);
	//Remove last square from path so we won't backtrack on ourself
	path.pop();
	
	//Place finish square (will overwrite most-recently placed square)
	//If current square is not a hole, we're good, otherwise we need to find a new square
	while(layout[current_pos.row][current_pos.col] == HOLE)
	{
		var possible_direction = findUnusedDirection(current_pos);
		if(possible_direction == -1) //no unused spaces nearby, must backtrack
		{
			//Change current square from HOLE to EMPTY
			layout[current_pos.row][current_pos.col] = EMPTY;
			current_pos = path.pop(); //path should never be empty (worst case: finish is 1 hop from start)
		}
		else
		{
			current_pos = getPositionInDirection(current_pos, possible_direction);
		}
	}
	layout[current_pos.row][current_pos.col] = FINISH;
	
	//Fill in remaining spaces with walls
	for(r = 0; r < level_height; ++r)
	{
		for(c = 0; c < level_width; ++c)
		{
			if(layout[r][c] == UNUSED)
			{
				layout[r][c] = WALL;
			}
		}
	}
	
	//Return level
	return new Level(level_width, level_height, layout);
}

//Returns the new position in the given direction of the given position
function getPositionInDirection(pos, dir)
{
	var next_pos;
	switch(dir)
	{
		case UP:
			next_pos = {row: pos.row - 1, col: pos.col};
			break;
		case DOWN:
			next_pos = {row: pos.row + 1, col: pos.col};
			break;
		case LEFT:
			next_pos = {row: pos.row, col: pos.col - 1};
			break;
		case RIGHT:
			next_pos = {row: pos.row, col: pos.col + 1};
			break;
	}
	return next_pos;
}

//Check if the given square can become part of the path
function isValidSquare(pos)
{
	//Check if in bounds
	if(pos.row < 0 || pos.row >= level_height || pos.col < 0 || pos.col >= level_width)
	{
		return false;
	}
	
	//Check if square available
	var square = layout[pos.row][pos.col];
	if(square == START || square == HOLE)
	{
		return false;
	}
	
	return true;
}

//Check if the given square is UNUSED
function isUnusedSquare(pos)
{
	//Check if in bounds
	if(pos.row < 0 || pos.row >= level_height || pos.col < 0 || pos.col >= level_width)
	{
		return false;
	}
	
	return (layout[pos.row][pos.col] == UNUSED);
}

//Returns a random direction towards an UNUSED square
//If there are none, returns -1
function findUnusedDirection(pos)
{
	var available_directions = [];
	if(isUnusedSquare(getPositionInDirection(pos, UP))) available_directions.push(UP);
	if(isUnusedSquare(getPositionInDirection(pos, DOWN))) available_directions.push(DOWN);
	if(isUnusedSquare(getPositionInDirection(pos, LEFT))) available_directions.push(LEFT);
	if(isUnusedSquare(getPositionInDirection(pos, RIGHT))) available_directions.push(RIGHT);
	
	if(available_directions.length == 0)
	{
		return -1;
	}
	else
	{
		return available_directions[randToRangeInt(rng.quick(), 0, available_directions.length)];
	}
}

//Takes a random float between 0 and 1 and scales to an int between lowerBound (incl) and upperBound (excl)
function randToRangeInt(rand, lowerBound, upperBound)
{
	return Math.floor(lowerBound + rand*(upperBound - lowerBound));
}

//Takes a random float between 0 and 1 and scales to a float between lowerBound (incl) and upperBound (excl)
function randToRangeFloat(rand, lowerBound, upperBound)
{
	return lowerBound + rand*(upperBound - lowerBound);
}