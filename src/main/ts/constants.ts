///<reference path="flags.ts"/>

const CONST_CHUNK_WIDTH = 12;
const CONST_CHUNK_HEIGHT = 12;
const CONST_CHUNK_DIMENSION_MIN = 12;
const CONST_CHUNK_DIMENSION_MAX = 12;
const CONST_DIRTY_PI = 3;
const CONST_DIRTY_PI_2 = 6;
const CONST_DIRTY_PI_ON_2 = 1.5;
const CONST_FAIRLY_ACCURATE_PI = 3.1416
const CONST_FAIRLY_ACCURATE_PI_2 = 6.2832;
const CONST_FAIRLY_ACCURATE_PI_DIV_2 = 1.5708;

const CONST_GL_SAFE_BITS = 24;
const CONST_BASE_RADIUS = .45;
const CONST_MAX_MONSTERS = 30;
const CONST_GUN_BARREL_OFFSET_Y = .3;
const CONST_GUN_BARREL_OFFSET_Z = .45;
const CONST_BULLET_RADIUS = .1;
const CONST_BULLET_LIFESPAN = 450;
const CONST_BULLET_VELOCITY = .02;
const CONST_BASE_BULLET_INTERVAL = 180;
const CONST_BASE_BUILDING_BIRTH_INTERVAL = 199;
const CONST_MAX_BUILDING_ACTIVATION_DISTANCE = CONST_BULLET_LIFESPAN * CONST_BULLET_VELOCITY + CONST_CHUNK_DIMENSION_MAX;
const CONST_MIN_BUILDING_ACTIVATION_DISTANCE = 3;
const CONST_SMALL_NUMBER = 1e-3;
// largest number we can do bitwise operations on
const CONST_BIG_NUMBER = 2147483647;//0x8FFFFFFE; Math.pow(2, 31)-1;
const CONST_MIN_BUILDING_DEPTH = 4;
const CONST_MAX_BUILDING_DEPTH = 20;
const CONST_ACTIVE_CHUNKS_WIDTH = 12;
const CONST_ACTIVE_CHUNKS_HEIGHT = 12;
const CONST_ACTIVE_CHUNKS_DIMENSION_MIN = 12;
const CONST_VISIBLE_DISTANCE = CONST_CHUNK_DIMENSION_MIN * CONST_ACTIVE_CHUNKS_DIMENSION_MIN/2;
const CONST_VISIBLE_DISTANCE_SQUARED = CONST_VISIBLE_DISTANCE*CONST_VISIBLE_DISTANCE;
const CONST_DIRECTIONAL_LIGHT_INTENSITY_DIV_2 = .1;
const CONST_DIRECTIONAL_LIGHT_FADE_OUT = .5;
const CONST_DIRECTIONAL_LIGHT_EXTRA_Z = .3;
const CONST_AMBIENT_LIGHT_INTENSITY = .2;
const CONST_CAMERA_LIGHT_DISTANCE = 9;
const CONST_CAMERA_LIGHT_INTENSITY = .5;
const CONST_MAX_FRAME_DURATION = 99;
const CONST_MAX_COLLISIONS = 9;
const CONST_PUSH_DIVISOR = 3e3;
const CONST_BUILDING_PLAYER_SPAWN_COS = -.2;
const CONST_FOV_Y = CONST_DIRTY_PI/4;
const CONST_TAN_FOV_Y_DIV_2 = 0.3936;
const CONST_DEATH_ANIMATION_TIME = 399; 
const CONST_FOG_COLOR_VECTOR = [.4, .2, .4, 0];
const CONST_FOG_COLOR_RGB = '#313';
const CONST_SKY_COLOR_HIGH_RGB = '#112'; 
const CONST_SKY_COLOR_LOW_RGB = '#435';
const CONST_SKY_COLOR_BALL_RGB = '#727';
const CONST_BUILDING_COLORS_RGB = [CONST_FOG_COLOR_RGB, '#324', '#335'];
const CONST_GRAVITY_ACCELERATION = 5e-5;//.00005;
const CONST_DAMAGE_FLASH_DURATION = 199;
const CONST_DAMAGE_FLASH_DURATION_2 = 399;
const CONST_BUILDING_VOLUME_HEALTH_RATIO = 7;
const CONST_BUILDING_DAMAGE_POWER_DIV = 2;
const CONST_BASE_BUILDING_POWER = 9;
const CONST_INERT_GRID_COLOR_RGB = [.05, .03, .03];
const CONST_MUZZLE_FLASH_DURATION = 99;
const CONST_MESSAGE_TIME = 999;
const CONST_STATUS_HEIGHT = 18;
const CONST_MAX_SOUND_RADIUS_SQRT = 3;
const CONST_MAX_SOUND_RADIUS_SQUARED = 99;
const CONST_FINISH_X_CHUNK = 50;
const CONST_FINISH_X = (CONST_FINISH_X_CHUNK+1) * CONST_CHUNK_WIDTH;
const CONST_FINISH_X_DIV_PI_ON_2 = CONST_FINISH_X / CONST_DIRTY_PI;
const CONST_FIXED_STEP = 9;
const CONST_AGGRO_DISTANCE_DIVISOR = 3;
const CONST_STARTING_BATTERY = 80;
const CONST_BASE_BULLET_COST = 3;
const CONST_BATTERY_WARNING = 30;
const CONST_BATTERY_SYMBOL = FLAG_ASCII_BATTERY_SYMBOL?'*':'⚡';
const CONST_CHARGE_FLOOR_DIFF = 699;
const CONST_RADIUS_SOUND_VOLUME_RATIO = 2;
const CONST_RADIUS_SOUND_VOLUME_RATIO_SQUARED = 4;
const CONST_WORLD_SEED = 99;
const CONST_SPAWN_JUMP_INTERVAL = 99;
const CONST_SPAWN_REST_INTERVAL = 3e3;//3000
const CONST_FRIENDLY_BRIGHT_LINE_COLOR = [1, 1, .7];
const CONST_FRIENDLY_BRIGHT_FILL_COLOR = [.8, .8, .5, .7];
const CONST_BATTERY_LEVEL_EXPONENT = .9;
const CONST_GEM_VELOCITY = .005;
// blur 1 = none 0 = all (.5 is excessive)
const CONST_FOCUS = .5;
// amount to boost colours 1 = none 2 = double
const CONST_BLOOM = 1.1;
const CONST_BATTERY_BOOST_ANIMATION_DURATION = 399;
const CONST_GRID_LINE_WIDTH = .02;
const CONST_WINCE_DURATION = 399;
const CONST_PLAYER_INVULNERABILITY_DURATION = CONST_WINCE_DURATION;
const CONST_WINCE_INTENSITY = .5;
const CONST_MAX_SHIELD_INTENSITY = .1;
const CONST_GUN_LATERAL_SCALE = .1;
const CONST_GUN_LENGTH_SCALE = .6;
const CONST_BATTERY_SEED = FLAG_PRODUCTION_MINIMAL?33812:4195348;
const CONST_MAX_WALL_DEPTH = 3;
const CONST_NEUTRAL_FILL_COLOR = [.3, .35, .33, 0];
const CONST_GOOD_FILL_COLOR = [.6, .6, .5, .5];
const CONST_BAD_FILL_COLOR = [.6, .1, .6, .5];
const CONST_STATUS_FONT = `${CONST_STATUS_HEIGHT}px sans-serif`;
const CONST_SIGN_CANVAS_WIDTH = 99;

// some globals we want to appear in the same var decl
let d = document;
let ls = localStorage;
