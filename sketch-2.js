// OLHARES — as caras da tua pintura olham, falam e dispersam-se (p5.js 2.x)
//
// Input:     rato/toque (posição, velocidade, clique) + tempo
// Expressão: a pintura ORIGINAL — os olhos são os do desenho (a íris pintada mexe-se dentro
//            do contorno real de cada olho) e cada cara é um recorte redondo que se afasta,
//            roda e fala
// Output:    visualização interativa + instalação sonora generativa
//
// Precisa de: imagemfinal/finalfaces.jpg (pasta ao lado do index.html) e Go Live
//
// Rato        os olhos seguem o cursor; as caras afastam-se quando passas por cima
// Clique      a cara clicada fala; as outras recuam e respondem (coro)
// Rato premido  dispersão forte (as caras fogem de ti)
// ESPAÇO      explosão: todas as caras se dispersam e cantam
// M           liga/desliga o som   |   E  mostra/esconde o movimento dos olhos   |   S  guarda PNG

const FILE = 'imagemfinal/finalfaces.jpg'; // pasta/ficheiro, relativo ao index.html
const COVER = false; // false = vê-se a pintura inteira | true = preenche o ecrã
const DATA_W = 1376; // largura da imagem em que as coordenadas abaixo foram medidas

// Caras: [x, y, raio x, raio y, ângulo em graus] (em píxeis da imagem original)
const FACES = [[105,70,85,75,-25],[245,85,75,80,0],[70,200,50,90,0],[210,240,70,60,-10],[355,170,90,115,0],[525,160,85,95,0],[625,255,85,100,20],[450,390,115,105,-20],[150,430,120,105,10],[625,475,90,95,0],[305,550,100,100,20],[110,615,105,90,30],[320,655,70,50,0],[515,610,150,100,0],[950,130,105,120,15],[1092,140,50,110,0],[1235,150,105,120,0],[825,215,90,90,20],[1340,200,40,45,0],[1062,335,80,65,0],[910,425,105,105,0],[1230,415,125,135,10],[780,485,55,55,0],[1030,505,85,115,0],[1140,550,55,60,0],[855,640,90,100,0],[1075,645,120,65,0],[1285,650,100,100,-20]];

// Olhos medidos na pintura original:
// h = contorno do olho | i = íris (com pupila) | s = cor da esclera | c = cor da íris
// d = círculo da íris [x, y, raio] | l = quanto a íris pode deslizar em 8 direções
const EYE_DATA = [{"h":[163,31,154,28,144,28,135,32,129,38,125,46,136,50,147,50,154,47,161,40],"i":[157,31,153,28,150,28,135,34,134,35,134,44,140,49,142,49,153,44,158,40,158,33],"s":[235,233,227],"c":[151,55,41],"d":[145.8,38.2,10.8],"l":[6.5,4.5,4.5,7.5,7.5,3.5,3.5,4.5],"b":0},{"h":[87,62,81,57,74,57,65,61,55,71,53,76,52,87,66,87,75,83,85,73,87,68],"i":[79,68,77,67,72,67,63,73,59,77,59,81,61,85,64,87,67,87,75,83,83,75,83,73],"s":[233,226,220],"c":[185,49,40],"d":[72.6,79.9,12.2],"l":[2.5,2.0,1.5,4.5,10.0,9.0,12.0,12.0],"b":0},{"h":[217,51,217,53,224,58,233,58,239,53,239,51,233,46,224,46],"i":[218,50,218,54,224,58,233,58,237,55,237,49,232,46,222,47],"s":[198,216,203],"c":[38,139,106],"d":[227.7,55.6,10.1],"l":[2.5,2.0,1.5,2.0,2.0,2.0,1.5,2.0],"b":0},{"h":[259,77,259,79,264,84,270,87,281,87,285,83,285,81,280,76,274,73,264,73],"i":[261,76,261,81,264,84,270,87,275,87,277,86,279,82,279,77,271,73,265,73],"s":[207,223,219],"c":[35,118,102],"d":[269.4,81.1,8.8],"l":[6.0,3.5,1.0,2.0,2.0,2.0,2.0,3.5],"b":0},{"h":[38,170,41,173,48,173,53,171,56,168,57,164,52,162,44,162,38,166],"i":[38,166,38,169,41,171,49,171,53,168,54,163,53,162,44,162],"s":[234,236,237],"c":[110,114,110],"d":[45.0,162.2,9.3],"l":[4.0,3.5,2.5,3.5,1.5,0.5,0.5,2.0],"b":0},{"h":[84,170,84,172,89,175,98,175,102,171,97,166,94,165,90,165],"i":[85,169,85,171,89,174,97,174,100,172,100,169,95,165,90,165],"s":[234,238,237],"c":[13,15,17],"d":[92.8,166.0,8.6],"l":[2.0,2.0,2.0,2.0,2.0,0.5,0.5,0.5],"b":0},{"h":[159,235,159,238,164,241,175,241,180,237,179,233,176,230,170,227,165,227,160,231,160,234],"i":[163,229,165,236,168,238,178,238,180,237,179,233,175,229,171,227,165,227],"s":[239,240,238],"c":[113,107,105],"d":[172.9,228.9,9.9],"l":[1.5,3.5,3.5,6.0,4.5,2.0,1.0,0.5],"b":0},{"h":[246,213,239,208,230,208,221,212,215,218,214,221,216,224,221,226,231,226,238,223,245,216],"i":[235,208,229,208,221,212,218,215,218,220,221,223,226,224,228,226,232,226,238,223,238,211],"s":[234,236,232],"c":[114,114,112],"d":[228.4,215.6,10.1],"l":[5.5,3.5,2.5,4.5,3.5,2.0,2.0,3.5],"b":0},{"h":[315,125,316,128,322,132,335,132,340,130,345,124,342,120,338,118,325,118,319,121],"i":[329,118,325,121,325,127,327,130,333,131,337,128,338,123,336,119,334,118],"s":[225,154,82],"c":[211,146,60],"d":[331.2,124.3,6.5],"l":[6.5,4.5,3.5,4.5,8.0,3.5,2.5,3.5],"b":1},{"h":[382,138,383,142,386,145,397,150,407,150,413,147,411,142,408,139,397,134,388,134],"i":[397,135,394,138,394,145,398,148,402,148,406,145,406,138,400,135],"s":[225,203,187],"c":[199,130,56],"d":[400.0,141.4,6.5],"l":[3.5,6.0,4.5,4.5,10.5,4.5,2.0,2.0],"b":1},{"h":[483,123,491,128,499,127,506,125,512,118,508,113,505,112,493,112,489,114,484,119],"i":[512,118,510,115,506,115,505,114,493,115,490,117,490,126,491,128,495,128,496,127,504,126,506,125],"s":[247,244,245],"c":[47,111,173],"d":[500.3,123.5,10.5],"l":[2.0,0.5,1.0,2.0,6.5,4.5,3.5,3.5],"b":0},{"h":[546,132,553,136,566,137,567,136,579,136,580,135,583,135,588,129,582,122,578,120,571,118,561,118,556,120,549,127],"i":[556,136,559,136,560,137,566,137,567,136,579,136,580,135,583,135,588,129,584,124,582,124,581,123,561,123,558,125,556,129],"s":[239,240,240],"c":[36,103,156],"d":[570.8,136.9,15.9],"l":[3.0,2.0,1.5,2.0,10.0,7.5,5.0,4.5],"b":0},{"h":[597,230,597,234,601,238,609,241,618,241,623,239,626,236,625,231,622,228,617,226,607,226,603,228,600,228],"i":[603,228,603,233,604,235,609,238,622,238,626,236,625,231,619,227,617,227,616,226,607,226],"s":[246,242,232],"c":[154,71,88],"d":[613.6,232.0,8.8],"l":[2.5,3.5,3.5,4.5,7.0,2.0,1.5,2.0],"b":0},{"h":[645,253,645,258,646,260,654,267,657,268,665,268,668,267,671,264,670,260,662,254,659,253],"i":[650,253,650,260,656,265,663,266,671,263,670,262,670,260,668,258,660,253],"s":[244,241,232],"c":[98,95,90],"d":[661.5,253.9,12.0],"l":[2.5,4.5,3.5,4.5,6.0,2.0,1.0,0.5],"b":0},{"h":[492,350,486,345,479,344,478,343,472,343,471,344,462,345,446,352,453,358,460,361,473,361,474,360,479,360,486,357],"i":[476,343,472,343,471,344,464,345,463,346,464,352,468,355,475,354,477,351,477,344],"s":[242,240,233],"c":[75,78,50],"d":[470.3,347.9,7.1],"l":[12.0,10.5,8.0,12.0,6.0,2.0,1.0,2.0],"b":1},{"h":[407,368,398,370,383,376,372,388,372,395,374,399,379,399,388,396,408,386,408,372,407,371],"i":[388,374,383,376,378,381,378,386,381,389,387,390,388,389,390,389,393,385,393,379,392,377],"s":[241,241,235],"c":[95,91,49],"d":[385.5,382.0,7.8],"l":[16.5,9.0,9.0,12.0,2.5,2.0,2.0,6.0],"b":1},{"h":[59,380,60,383,67,390,75,394,78,394,83,396,99,396,100,395,104,395,111,392,119,385,117,380,110,373,95,368,79,368,78,369,75,369,66,373],"i":[82,372,78,377,78,386,79,388,85,392,91,392,92,391,94,391,98,387,98,385,99,384,99,379,97,374,93,371,84,371],"s":[232,231,228],"c":[27,100,160],"d":[88.3,381.3,10.7],"l":[19.0,10.5,7.5,9.0,17.5,9.0,6.5,7.5],"b":1},{"h":[158,395,158,401,159,403,164,408,177,415,183,417,187,417,188,418,212,418,219,416,218,409,214,400,209,395,200,390,187,386,173,386,162,390],"i":[184,393,178,397,176,401,176,408,180,414,185,416,190,416,196,413,198,410,198,408,199,407,199,402,197,397,195,395,191,393],"s":[240,237,230],"c":[189,130,78],"d":[187.4,404.4,11.5],"l":[19.0,9.0,5.5,6.0,14.0,14.5,10.0,10.5],"b":1},{"h":[1000,70,995,65,990,63,980,64,971,69,967,73,965,77,964,88,980,87,987,85,992,82,997,77],"i":[996,66,991,63,986,63,985,64,980,64,972,68,965,76,965,83,967,84,969,84,972,82,974,82,975,83,982,83,983,82,988,81,993,76,994,71,996,69],"s":[243,245,243],"c":[105,107,105],"d":[980.5,73.6,12.6],"l":[6.5,6.0,6.0,7.5,2.5,2.0,1.5,3.5],"b":0},{"h":[925,110,906,111,897,115,890,122,890,128,891,129,892,136,909,133,916,130,924,122],"i":[919,112,916,110,915,111,905,111,897,115,890,122,890,128,892,131,894,131,896,130,898,127,907,128,915,125,919,119],"s":[245,245,243],"c":[100,100,99],"d":[901.8,113.7,16.4],"l":[9.0,7.5,7.0,6.0,2.0,2.0,1.5,3.5],"b":0},{"h":[1057,93,1069,93,1070,92,1074,92,1081,87,1081,81,1078,80,1066,80,1059,85],"i":[1076,81,1074,80,1070,80,1063,83,1060,85,1060,90,1063,92,1071,92,1073,91,1076,87],"s":[255,249,243],"c":[165,83,51],"d":[1068.3,86.3,7.0],"l":[6.0,3.5,2.0,3.5,3.5,2.0,2.0,3.5],"b":0},{"h":[1109,76,1110,79,1116,82,1128,82,1133,80,1135,78,1135,76,1133,74,1128,72,1116,72],"i":[1115,76,1115,81,1116,82,1128,82,1128,76,1125,74,1118,74],"s":[255,244,234],"c":[154,88,53],"d":[1121.5,80.1,6.8],"l":[7.0,2.0,1.0,0.5,5.5,4.5,3.5,4.5],"b":0},{"h":[1224,98,1210,92,1203,92,1202,93,1195,94,1187,98,1179,106,1178,114,1184,118,1197,118,1198,117,1202,117,1212,113,1221,104],"i":[1199,93,1197,95,1197,97,1196,98,1197,105,1202,109,1209,109,1211,108,1214,105,1214,103,1215,102,1214,95,1211,92,1203,92,1202,93],"s":[247,248,243],"c":[193,56,27],"d":[1205.5,99.9,9.3],"l":[7.5,7.5,8.5,16.0,9.0,3.5,2.0,3.5],"b":1},{"h":[1265,110,1269,116,1275,122,1289,128,1304,128,1311,125,1317,118,1315,114,1309,108,1302,104,1295,102,1280,102],"i":[1289,103,1283,108,1283,118,1289,123,1296,123,1298,122,1302,117,1302,109,1298,104,1296,104,1295,103],"s":[233,234,238],"c":[208,69,25],"d":[1292.4,113.0,10.0],"l":[11.5,12.0,8.0,9.0,15.5,6.0,4.5,4.5],"b":1},{"h":[849,180,845,176,842,175,831,175,822,179,815,186,815,191,822,195,833,195,841,192,849,184],"i":[840,176,839,175,830,175,822,179,819,182,819,184,824,188,834,188,839,185,840,183],"s":[246,246,246],"c":[102,102,102],"d":[829.2,177.9,11.0],"l":[10.0,9.0,8.5,10.5,3.0,2.0,1.0,2.0],"b":0},{"h":[781,205,777,207,773,211,771,215,771,223,772,226,777,232,783,235,790,235,797,229,799,225,799,217,796,211,796,209,794,207,788,205],"i":[789,205,782,205,778,207,771,215,771,224,774,229,779,233,783,232,785,228,791,227,795,222,795,213,794,211,791,209,791,207],"s":[240,241,243],"c":[53,118,172],"d":[783.3,218.1,12.0],"l":[6.0,7.5,5.0,3.5,2.0,2.0,3.0,4.5],"b":0},{"h":[1342,172,1343,177,1345,179,1352,182,1358,180,1361,177,1358,174,1352,171,1344,171],"i":[1344,171,1344,174,1346,176,1353,177,1355,178,1356,180,1358,180,1361,177,1357,173,1353,171],"s":[249,238,238],"c":[117,68,69],"d":[1351.9,172.1,6.8],"l":[1.0,2.0,2.5,3.5,3.5,0.5,0.0,0.5],"b":0},{"h":[1024,304,1024,307,1029,312,1033,314,1041,315,1047,313,1050,310,1050,307,1045,302,1037,299,1029,300],"i":[1029,301,1030,310,1035,313,1043,314,1048,312,1050,310,1050,307,1043,301,1036,300,1035,299,1030,300],"s":[219,220,220],"c":[147,100,109],"d":[1038.1,306.6,8.2],"l":[2.0,2.0,2.5,3.5,5.5,3.5,1.5,2.0],"b":0},{"h":[1077,321,1077,324,1083,330,1087,332,1097,333,1103,329,1103,326,1096,319,1090,317,1083,317],"i":[1081,318,1081,322,1082,324,1088,329,1090,329,1091,330,1099,330,1103,328,1103,326,1094,318,1092,318,1091,317,1083,317],"s":[247,249,247],"c":[115,103,102],"d":[1091.4,323.6,8.6],"l":[2.0,4.5,4.0,4.5,5.5,2.0,1.0,0.5],"b":0},{"h":[917,376,920,379,927,382,943,382,952,379,957,376,963,370,963,364,960,361,953,358,938,358,937,359,934,359,923,364,917,370],"i":[945,364,942,362,937,363,930,367,930,371,933,373,940,373,945,369],"s":[244,171,57],"c":[184,71,80],"d":[937.7,367.9,6.4],"l":[19.5,13.0,10.5,13.0,13.0,6.0,6.0,9.0],"b":0},{"h":[1303,346,1293,345,1292,344,1278,344,1271,346,1256,354,1247,364,1242,378,1243,379,1249,379,1250,380,1268,380,1269,379,1278,378,1284,374,1295,363],"i":[1254,358,1251,363,1251,372,1252,374,1257,378,1267,378,1269,377,1273,372,1273,362,1271,359,1266,356,1258,356],"s":[242,236,228],"c":[228,155,76],"d":[1262.0,367.2,11.5],"l":[18.0,6.0,5.5,7.5,7.0,6.0,7.5,20.5],"b":1},{"h":[660,414,644,414,633,419,625,427,620,434,628,435,629,436,641,436,651,431,658,423,659,415],"i":[639,419,636,423,636,428,637,430,640,433,648,433,651,430,651,428,652,427,651,421,647,418,641,418],"s":[233,233,220],"c":[200,124,62],"d":[643.9,425.6,7.8],"l":[4.5,3.5,3.5,7.5,10.0,6.0,5.5,9.0],"b":1},{"h":[591,460,589,458,584,456,578,456,566,461,560,466,555,480,572,478,583,474,590,468,592,464],"i":[581,462,574,462,570,466,570,473,572,476,576,477,579,475,583,474,585,472,585,466],"s":[236,241,236],"c":[209,122,49],"d":[577.5,469.6,7.8],"l":[3.5,2.0,2.0,4.5,12.5,7.5,7.5,10.5],"b":1},{"h":[272,499,272,507,275,510,300,511,305,508,302,502,296,496,291,494,281,493,276,495],"i":[278,501,278,503,277,504,278,509,279,510,287,510,289,511,291,509,291,501,287,498,282,498],"s":[248,237,236],"c":[229,53,74],"d":[284.4,505.0,7.1],"l":[13.0,2.0,1.5,2.0,7.0,7.5,6.5,7.5],"b":0},{"h":[326,530,326,537,330,546,342,557,349,558,362,552,365,549,364,541,354,531,337,519],"i":[347,530,345,533,345,540,349,544,356,544,358,543,360,540,360,537,353,530,351,529],"s":[240,190,190],"c":[203,49,71],"d":[352.6,536.4,7.8],"l":[2.0,10.5,14.0,17.5,20.5,13.0,2.0,2.0],"b":0},{"h":[139,587,135,583,130,581,114,582,108,585,102,590,101,592,101,599,111,603,122,603,123,602,126,602,129,600,131,600,138,594,139,592],"i":[133,590,128,586,125,586,119,589,117,589,112,592,112,600,115,603,122,603,123,602,126,602,129,600,131,600,134,597,134,592],"s":[238,236,231],"c":[48,116,93],"d":[123.5,597.3,11.1],"l":[4.5,2.0,1.5,3.5,12.0,9.0,8.0,9.0],"b":0},{"h":[59,612,55,614,50,619,49,627,52,633,55,636,59,638,66,638,74,631,75,622,70,612],"i":[72,618,65,619,62,622,61,624,61,633,62,635,68,636,74,631,75,622],"s":[231,233,233],"c":[139,123,83],"d":[69.8,627.7,9.4],"l":[1.5,2.0,2.5,6.0,12.5,12.0,6.5,2.0],"b":0},{"h":[284,650,287,652,297,652,298,651,301,651,305,649,312,640,311,639,293,639,286,644,284,647],"i":[288,643,288,647,289,649,294,651,297,651,298,650,301,650,305,647,306,645,306,639,293,639],"s":[238,235,231],"c":[112,111,108],"d":[296.5,641.4,9.5],"l":[5.0,3.5,3.0,4.5,4.0,2.0,1.0,2.0],"b":0},{"h":[354,644,352,649,352,658,356,662,364,666,368,661,368,652,364,648],"i":[356,646,354,648,354,654,355,656,360,660,365,660,368,658,368,652,364,648,360,646],"s":[244,242,241],"c":[9,7,6],"d":[362.3,651.7,8.2],"l":[1.5,3.5,5.5,4.5,4.5,3.5,1.5,0.5],"b":0},{"h":[400,599,410,604,420,607,424,607,425,608,439,608,440,607,445,607,454,604,459,600,464,594,454,588,445,585,425,584,424,585,416,586,409,589],"i":[416,592,416,598,417,600,420,603,424,605,446,605,452,601,455,597,455,591,451,588,426,588,425,589,420,589],"s":[239,233,228],"c":[175,82,64],"d":[435.5,595.5,15.1],"l":[10.0,6.0,5.0,7.5,16.5,7.5,5.0,6.0],"b":0},{"h":[541,598,556,606,565,607,566,608,578,608,579,607,585,607,595,603,602,595,591,589,585,587,566,586,565,587,560,587,553,589,549,591],"i":[555,594,555,602,560,606,579,607,580,606,585,605,588,602,588,594,585,592,558,592],"s":[240,235,231],"c":[194,80,56],"d":[571.5,598.3,13.1],"l":[13.0,4.5,3.0,3.5,12.5,9.0,7.0,9.0],"b":0},{"h":[882,409,877,402,872,400,856,400,855,401,852,401,846,403,834,410,828,417,828,423,832,427,861,428,867,426,875,421,882,413],"i":[850,417,850,424,852,428,862,428,871,424,871,417,869,413,864,410,857,410,853,412],"s":[245,177,40],"c":[239,172,28],"d":[860.5,420.5,10.7],"l":[6.0,2.0,2.0,3.5,23.0,14.5,13.0,16.0],"b":1},{"h":[794,472,792,470,786,469,780,472,777,475,776,478,781,481,784,481,789,479,793,475],"i":[791,475,789,474,785,474,781,477,781,481,785,481,789,479,791,477],"s":[248,247,247],"c":[94,94,96],"d":[786.6,479.6,5.6],"l":[1.0,0.5,0.0,0.5,4.0,4.5,5.0,6.0],"b":0},{"h":[741,498,748,499,749,500,758,500,761,497,761,491,759,490,746,490,743,493],"i":[746,496,746,499,748,499,749,500,758,500,761,497,761,493,758,491,752,491,747,494],"s":[254,254,253],"c":[158,88,59],"d":[754.8,499.9,9.0],"l":[1.5,0.5,0.5,2.0,5.0,3.5,2.5,2.0],"b":0},{"h":[1018,454,1015,451,1009,449,1001,450,997,452,992,457,991,462,995,464,1000,464,1001,465,1009,464,1013,462,1018,457],"i":[1010,449,1001,450,997,452,994,455,994,457,997,459,997,464,1005,465,1006,464,1010,464,1013,462,1013,456,1011,454,1011,450],"s":[255,251,251],"c":[137,94,111],"d":[1004.1,457.3,8.9],"l":[4.0,2.0,1.5,2.0,3.0,2.0,1.5,3.5],"b":0},{"h":[1048,468,1050,471,1058,475,1065,477,1076,476,1080,472,1080,470,1077,466,1072,463,1065,461,1055,462],"i":[1053,464,1053,472,1060,476,1063,476,1064,477,1068,476,1069,475,1069,471,1070,470,1077,474,1080,472,1080,470,1076,465,1070,462,1061,461,1060,462,1055,462],"s":[248,248,245],"c":[101,94,93],"d":[1064.3,466.8,10.6],"l":[2.5,2.0,2.0,2.0,3.5,2.0,1.0,2.0],"b":0},{"h":[1207,405,1182,405,1166,412,1159,419,1156,424,1154,441,1168,444,1169,445,1179,445,1188,442,1193,439,1201,431,1204,426],"i":[1174,409,1169,413,1167,417,1167,426,1168,427,1168,429,1172,433,1176,435,1185,435,1189,433,1193,428,1193,426,1194,425,1194,419,1192,414,1188,410,1184,408,1177,408,1176,409],"s":[240,193,160],"c":[234,155,75],"d":[1180.3,421.7,13.6],"l":[14.0,12.0,13.0,17.5,10.5,6.0,5.5,10.5],"b":1},{"h":[1154,510,1145,509,1138,512,1132,518,1132,522,1136,525,1143,524,1152,516],"i":[1153,510,1144,509,1139,513,1139,518,1143,521,1148,520,1152,516,1154,511],"s":[221,238,242],"c":[43,121,133],"d":[1146.7,514.9,7.2],"l":[1.5,0.5,2.0,7.5,4.5,2.0,1.0,2.0],"b":0},{"h":[1126,533,1124,534,1117,534,1111,536,1110,537,1109,549,1128,549,1130,547,1130,542],"i":[1124,534,1116,534,1111,539,1110,541,1110,545,1115,548,1119,548,1126,544,1128,541,1128,537],"s":[226,235,235],"c":[42,132,128],"d":[1118.8,540.4,7.9],"l":[4.0,4.5,3.0,3.5,3.0,2.0,2.0,2.0],"b":0},{"h":[794,609,795,612,800,614,804,614,805,615,822,615,829,610,829,606,825,602,818,599,802,599,795,604,795,608],"i":[822,603,818,602,813,605,813,609,816,611,818,611,823,608,823,604],"s":[250,250,250],"c":[30,107,152],"d":[818.0,606.5,4.6],"l":[6.0,6.0,6.0,9.0,20.0,7.5,4.0,3.5],"b":0},{"h":[877,611,881,613,892,614,893,615,910,615,916,613,921,608,922,604,917,599,913,597,904,596,903,595,897,595,896,596,891,596,882,600,878,604],"i":[902,611,905,613,916,612,921,608,921,605,918,603,907,602,905,603,902,607],"s":[244,247,247],"c":[35,98,161],"d":[910.9,607.4,7.3],"l":[2.5,2.0,2.5,4.5,27.0,12.0,5.5,4.5],"b":0},{"h":[985,644,988,648,997,652,1014,652,1021,649,1025,644,1021,639,1014,636,997,636,988,640],"i":[985,644,986,646,988,647,990,647,991,646,992,647,992,650,996,652,1015,652,1017,650,1017,646,1022,644,1023,643,1023,641,1021,639,1015,636,996,636,988,640],"s":[238,234,233],"c":[108,105,105],"d":[1004.1,634.8,18.9],"l":[5.0,3.5,2.0,2.0,3.5,2.0,1.5,2.0],"b":0},{"h":[1125,646,1128,650,1137,654,1154,654,1161,651,1165,646,1161,641,1154,638,1137,638,1128,642],"i":[1128,642,1128,645,1133,648,1133,652,1136,654,1155,654,1158,652,1158,647,1161,644,1161,641,1155,638,1136,638],"s":[237,234,230],"c":[119,80,71],"d":[1144.8,639.7,16.1],"l":[5.0,3.5,2.5,3.5,5.5,2.0,1.5,2.0],"b":0},{"h":[1344,607,1338,602,1333,600,1317,600,1316,601,1309,602,1294,610,1288,617,1288,619,1284,627,1290,627,1291,628,1314,628,1315,627,1318,627,1324,625,1335,619,1341,613],"i":[1328,610,1327,608,1325,608,1324,607,1322,607,1321,608,1313,608,1312,609,1306,610,1300,614,1299,616,1299,620,1300,622,1302,622,1306,624,1314,624,1315,623,1320,622,1327,616,1328,614],"s":[244,243,239],"c":[30,109,90],"d":[1313.5,615.2,11.4],"l":[14.5,7.5,6.5,10.5,14.5,9.0,8.5,14.5],"b":0},{"h":[1250,636,1249,637,1231,640,1222,644,1214,651,1212,655,1212,660,1215,663,1220,665,1225,665,1235,662,1241,658,1246,653,1250,642],"i":[1248,639,1247,638,1241,638,1240,639,1235,639,1233,640,1228,648,1228,653,1231,655,1236,655,1240,653,1247,646,1248,644],"s":[244,244,241],"c":[33,111,94],"d":[1237.6,645.6,9.2],"l":[4.5,4.5,8.0,17.5,9.0,2.0,2.0,3.5],"b":0}];

const VOWELS = [ // formantes: [frequência, Q, ganho]
  [[800, 8, 1.0], [1150, 10, 0.6], [2800, 12, 0.25]], // a
  [[450, 8, 1.0], [800, 10, 0.7], [2830, 12, 0.15]],  // o
  [[400, 8, 1.0], [2000, 12, 0.5], [2800, 12, 0.3]],  // e
  [[325, 8, 1.0], [700, 10, 0.6], [2530, 12, 0.1]],   // u
  [[300, 8, 1.0], [2300, 12, 0.5], [3000, 12, 0.3]],  // i
];

let IW, IH, K = 1;
let base, bgBlur, holes;
let faces = [], eyes = [];
let sc = 1, ox = 0, oy = 0;
let ready = false, loadError = false, showEyes = true;
let lastMX = -1, lastMY = -1, lastMove = -99999, everMoved = false;
let AC = null, master = null, reverb = null, noiseBuf = null, soundOn = true, voices = 0;
let nextMurmur = 0, startT = 0, lastT = 0;

// ---------- arranque ----------
async function setup() {
  createCanvas(windowWidth, windowHeight);
  startT = millis();
  try {
    const im = await loadNative(FILE);
    IW = im.naturalWidth; IH = im.naturalHeight; K = IW / DATA_W;
    base = mkCanvas(IW, IH);
    base.getContext('2d').drawImage(im, 0, 0);
    buildFaces();
    buildLayers();
    buildEyes();
    fit();
    ready = true;
  } catch (e) {
    loadError = true;
    console.error('Não encontrei a imagem em: ' + FILE, e);
  }
}

function loadNative(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('404: ' + url));
    im.src = url;
  });
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rgb(a) { return 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')'; }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function lerpN(a, b, t) { return a + (b - a) * t; }

function fit() {
  sc = COVER ? Math.max(width / IW, height / IH) : Math.min(width / IW, height / IH);
  ox = (width - IW * sc) / 2;
  oy = (height - IH * sc) / 2;
}

// notas de uma escala pentatónica menor (A) em 3 oitavas, para o coro soar bem
const SCALE = (() => {
  const out = [];
  for (let o = 0; o < 3; o++) for (const s of [0, 3, 5, 7, 10]) out.push(110 * Math.pow(2, (s + 12 * o) / 12));
  return out;
})();

function buildFaces() {
  faces = FACES.map(([cx, cy, rx, ry, a], i) => {
    const area = rx * ry;
    const t = clamp((area - 2000) / 16000, 0, 1);                   // cara grande = voz grave
    const idx = clamp(Math.round(lerpN(SCALE.length - 3, 1, t)) + Math.floor(Math.random() * 3) - 1, 0, SCALE.length - 1);
    return {
      i, cx: cx * K, cy: cy * K, rx: rx * K, ry: ry * K, ang: a * Math.PI / 180,
      px: 0, py: 0, vx: 0, vy: 0, rot: 0, vr: 0, talk: 0, active: false,
      pitch: SCALE[idx], vowel: i % VOWELS.length, hoverAt: 0, eyes: [],
    };
  });
}

function ellipsePath(f, s) {
  const p = new Path2D();
  p.ellipse(f.cx, f.cy, f.rx * s, f.ry * s, f.ang, 0, Math.PI * 2);
  return p;
}

function buildLayers() {
  // fundo: a própria pintura, muito difuminada (aparece quando as caras saem do sítio)
  const sw = Math.max(8, Math.round(IW / 30)), sh = Math.max(6, Math.round(IH / 30));
  const small = mkCanvas(sw, sh);
  const sg = small.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(base, 0, 0, sw, sh);
  bgBlur = mkCanvas(IW, IH);
  const bg = bgBlur.getContext('2d'); bg.imageSmoothingEnabled = true; bg.imageSmoothingQuality = 'high';
  bg.drawImage(small, 0, 0, IW, IH);
  bg.fillStyle = 'rgba(25,10,35,0.30)'; bg.fillRect(0, 0, IW, IH);
  // pintura com "buracos" no sítio das caras
  holes = mkCanvas(IW, IH);
  const hg = holes.getContext('2d');
  hg.drawImage(base, 0, 0);
  hg.globalCompositeOperation = 'destination-out';
  hg.fillStyle = '#000';
  for (const f of faces) hg.fill(ellipsePath(f, 0.97));
}

function pathFrom(flat, dx, dy) {
  const p = new Path2D();
  for (let i = 0; i < flat.length; i += 2) {
    const x = flat[i] * K - (dx || 0), y = flat[i + 1] * K - (dy || 0);
    if (i === 0) p.moveTo(x, y); else p.lineTo(x, y);
  }
  p.closePath();
  return p;
}

function buildEyes() {
  eyes = [];
  for (const d of EYE_DATA) {
    if (!d) continue;
    const cx = d.d[0] * K, cy = d.d[1] * K, r = d.d[2] * K;
    // sprite da íris: pixéis ORIGINAIS da pintura (+ a parte da íris escondida sob a pálpebra)
    const R = Math.ceil(r * 1.3) + 3;
    const x0 = Math.round(cx - R), y0 = Math.round(cy - R), w = 2 * R, h = 2 * R;
    const c = mkCanvas(w, h), g = c.getContext('2d');
    g.save();
    const outside = new Path2D(); outside.rect(0, 0, w, h); outside.addPath(pathFrom(d.h, x0, y0));
    g.clip(outside, 'evenodd');
    g.fillStyle = rgb(d.c); g.beginPath(); g.arc(cx - x0, cy - y0, r, 0, Math.PI * 2); g.fill();
    g.restore();
    g.save();
    g.clip(pathFrom(d.i, x0, y0));
    g.drawImage(base, x0, y0, w, h, 0, 0, w, h);
    g.restore();
    // só ficam os pixéis da íris: tira a pálpebra escura que o recorte possa ter apanhado
    if (d.b) {
      const im = g.getImageData(0, 0, w, h), px = im.data;
      for (let q = 0; q < px.length; q += 4) {
        if (px[q + 3] === 0) continue;
        const lum = 0.299 * px[q] + 0.587 * px[q + 1] + 0.114 * px[q + 2];
        const dd = Math.hypot(px[q] - d.c[0], px[q + 1] - d.c[1], px[q + 2] - d.c[2]);
        if (lum >= 34 && lum <= 85 && dd > 60 && px[q] - px[q + 1] > 20) px[q + 3] = 0;
      }
      g.putImageData(im, 0, 0);
    }
    // silhueta da íris com a cor da esclera (tapa o sítio original quando a íris sai dali)
    const sil = mkCanvas(w, h), sg2 = sil.getContext('2d');
    for (const [ax, ay] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) sg2.drawImage(c, ax, ay);
    sg2.globalCompositeOperation = 'source-in';
    sg2.fillStyle = rgb(d.s); sg2.fillRect(0, 0, w, h);
    // a que cara pertence
    let best = 0, bd = 1e9;
    for (const f of faces) {
      const dx = cx - f.cx, dy = cy - f.cy, co = Math.cos(-f.ang), si = Math.sin(-f.ang);
      const u = dx * co - dy * si, v = dx * si + dy * co;
      const n = (u / f.rx) ** 2 + (v / f.ry) ** 2;
      if (n < bd) { bd = n; best = f.i; }
    }
    const e = {
      hull: pathFrom(d.h), spr: { c, sil, x0, y0 },
      lim: d.l.map(v => v * K), cx, cy, gx: 0, gy: 0, face: faces[best],
    };
    faces[best].eyes.push(e);
    eyes.push(e);
  }
}

// ---------- ciclo principal ----------
function draw() {
  background(14);
  const ctx = drawingContext;
  if (loadError) {
    msg(ctx, 'Não encontrei a imagem:\n' + FILE + '\n\nVerifica o nome da pasta e do ficheiro.');
    return;
  }
  if (!ready) { msg(ctx, 'a carregar…'); return; }

  const now = millis(), t = now / 1000;
  if (mouseX !== lastMX || mouseY !== lastMY) {
    if (lastMX >= 0) { lastMove = now; everMoved = true; }
  }
  const speed = lastMX < 0 ? 0 : Math.hypot(mouseX - lastMX, mouseY - lastMY);
  lastMX = mouseX; lastMY = mouseY;

  const mx = (mouseX - ox) / sc, my = (mouseY - oy) / sc;
  const live = everMoved && now - lastMove < 120000;
  const inside = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  // para onde olham: o cursor, ou um passeio calmo se o rato estiver parado
  let tx = mouseX, ty = mouseY;
  if (!everMoved || now - lastMove > 4000) {
    tx = width / 2 + Math.sin(t * 0.4) * width * 0.4 + Math.sin(t * 0.93) * width * 0.1;
    ty = height / 2 + Math.cos(t * 0.33) * height * 0.35;
  }

  const dt = lastT ? clamp((now - lastT) / 16.667, 0.4, 3) : 1;  // a física não depende do fps
  lastT = now;
  physics(mx, my, live && inside, speed, now, dt);
  updateEyes(tx, ty, t);
  murmurs(now);
  render(ctx, t);
  overlay(ctx, now);
}

function physics(mx, my, live, speed, now, dt) {
  const pressed = mouseIsPressed;
  const R = (pressed ? 300 : 150) * K;
  for (const f of faces) {
    const dx = f.cx + f.px - mx, dy = f.cy + f.py - my;
    const d = Math.hypot(dx, dy) || 1;
    if (live && d < R) {
      const s = Math.pow(1 - d / R, 2) * (pressed ? 2.6 : 1.1) * K;
      f.vx += dx / d * s * dt; f.vy += dy / d * s * dt;
      f.vr += (dx > 0 ? 1 : -1) * s * 0.004 * dt;
    }
    // som ao passar rápido por cima de uma cara
    if (live && speed > 14 && hit(f, mx, my) && now - f.hoverAt > 1600) {
      f.hoverAt = now; f.talk = Math.max(f.talk, 0.6); speak(f, 0.22, 0);
    }
    f.vx += -0.005 * f.px * dt; f.vy += -0.005 * f.py * dt;   // mola: volta ao sítio, devagar
    const damp = Math.pow(0.93, dt);
    f.vx *= damp; f.vy *= damp;
    f.px += f.vx * dt; f.py += f.vy * dt;
    const m = Math.hypot(f.px, f.py), maxd = 320 * K;
    if (m > maxd) { f.px *= maxd / m; f.py *= maxd / m; }
    f.vr += -0.02 * f.rot * dt; f.vr *= Math.pow(0.9, dt); f.rot += f.vr * dt;
    f.talk *= Math.pow(0.94, dt);
    f.active = Math.hypot(f.px, f.py) > 0.5 || Math.abs(f.rot) > 0.004 || f.talk > 0.02 || Math.hypot(f.vx, f.vy) > 0.05;
  }
}

function hit(f, mx, my) {
  const dx = mx - (f.cx + f.px), dy = my - (f.cy + f.py);
  const a = f.ang + f.rot, co = Math.cos(-a), si = Math.sin(-a);
  const u = dx * co - dy * si, v = dx * si + dy * co;
  return (u / f.rx) ** 2 + (v / f.ry) ** 2 <= 1;
}

function updateEyes(tx, ty, t) {
  for (const e of eyes) {
    const f = e.face;
    const X = ox + (e.cx + f.px) * sc, Y = oy + (e.cy + f.py) * sc;
    const dx = tx - X, dy = ty - Y, d = Math.hypot(dx, dy);
    let a = Math.atan2(dy, dx) - f.rot;
    a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const u = a / (Math.PI / 4), i0 = Math.floor(u) % 8, i1 = (i0 + 1) % 8, fr = u - Math.floor(u);
    const L = lerpN(e.lim[i0], e.lim[i1], fr);
    const k = Math.min(1, d / (90 * sc));
    const jit = f.talk * 0.8;                              // olhos inquietos quando a cara fala
    const gx = Math.cos(a) * L * 0.92 * k + Math.sin(t * 40 + e.cx) * jit;
    const gy = Math.sin(a) * L * 0.92 * k + Math.cos(t * 37 + e.cy) * jit;
    e.gx = lerpN(e.gx, gx, 0.22);
    e.gy = lerpN(e.gy, gy, 0.22);
  }
}

function drawEye(ctx, e) {
  if (!showEyes) return;
  ctx.save();
  ctx.clip(e.hull);
  ctx.drawImage(e.spr.sil, e.spr.x0, e.spr.y0);              // descobre o sítio original da íris
  ctx.drawImage(e.spr.c, e.spr.x0 + e.gx, e.spr.y0 + e.gy);  // íris pintada, deslocada
  ctx.restore();
}

function render(ctx, t) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(sc, sc);
  ctx.imageSmoothingEnabled = true;
  let any = false;
  for (const f of faces) if (f.active) { any = true; break; }
  if (!any) {
    ctx.drawImage(base, 0, 0);
    for (const e of eyes) drawEye(ctx, e);
  } else {
    ctx.drawImage(bgBlur, 0, 0);
    ctx.drawImage(holes, 0, 0);
    const order = faces.slice().sort((a, b) => Math.hypot(a.px, a.py) - Math.hypot(b.px, b.py));
    for (const f of order) drawFace(ctx, f, t);
  }
  ctx.restore();
}

function drawFace(ctx, f, t) {
  const a = clamp(Math.hypot(f.px, f.py) / (40 * K), 0, 1);
  const s = 1 + 0.05 * f.talk * Math.sin(t * 28 + f.i);
  ctx.save();
  ctx.translate(f.cx + f.px, f.cy + f.py);
  ctx.rotate(f.rot);
  ctx.scale(s, s);
  ctx.translate(-f.cx, -f.cy);
  const path = ellipsePath(f, 1);
  if (a > 0.03) {                                        // sombra: a cara "descola" da tela
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,' + (0.5 * a) + ')';
    ctx.shadowBlur = 26 * a; ctx.shadowOffsetY = 10 * a;
    ctx.fillStyle = '#000'; ctx.fill(path);
    ctx.restore();
  }
  ctx.save();
  ctx.clip(path);
  const R = Math.max(f.rx, f.ry) + 3;
  const bx = Math.max(0, f.cx - R), by = Math.max(0, f.cy - R);
  const bw = Math.min(IW, f.cx + R) - bx, bh = Math.min(IH, f.cy + R) - by;
  ctx.drawImage(base, bx, by, bw, bh, bx, by, bw, bh);
  for (const e of f.eyes) drawEye(ctx, e);
  ctx.restore();
  if (a > 0.03) {                                        // contorno grosso, como na pintura
    ctx.strokeStyle = 'rgba(20,20,20,' + a + ')';
    ctx.lineWidth = 3.5;
    ctx.stroke(path);
  }
  ctx.restore();
}

// ---------- som ----------
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return;
  AC = new C();
  master = AC.createGain(); master.gain.value = 0.8;
  const comp = AC.createDynamicsCompressor();
  comp.threshold.value = -20; comp.ratio.value = 6;
  master.connect(comp); comp.connect(AC.destination);
  const len = Math.floor(AC.sampleRate * 2.2), ir = AC.createBuffer(2, len, AC.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  reverb = AC.createConvolver(); reverb.buffer = ir;
  const wet = AC.createGain(); wet.gain.value = 0.5;
  reverb.connect(wet); wet.connect(master);
  noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
}

// a cara "fala": voz sintetizada (serra + formantes de vogal + vibrato + sopro)
function speak(f, vol, delay) {
  if (!AC || !soundOn || AC.state !== 'running' || voices >= 9) return;
  const t0 = AC.currentTime + (delay || 0) + 0.01;
  const dur = 0.5 + Math.random() * 0.7;
  const vow = VOWELS[(f.vowel + (Math.random() < 0.4 ? 1 : 0)) % VOWELS.length];
  const f0 = f.pitch * (Math.random() < 0.2 ? 1.5 : 1);
  const osc = AC.createOscillator(); osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(f0 * 0.94, t0);
  osc.frequency.linearRampToValueAtTime(f0 * 1.03, t0 + dur * 0.25);
  osc.frequency.linearRampToValueAtTime(f0 * 0.86, t0 + dur);
  const lfo = AC.createOscillator(); lfo.frequency.value = 5 + Math.random() * 1.5;
  const lg = AC.createGain(); lg.gain.value = f0 * 0.012;
  lfo.connect(lg); lg.connect(osc.frequency);
  const env = AC.createGain();
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(vol, t0 + 0.07);
  env.gain.setTargetAtTime(0, t0 + dur * 0.6, dur * 0.16);
  for (const [F, Q, g] of vow) {
    const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = F; bp.Q.value = Q;
    const gg = AC.createGain(); gg.gain.value = g * 4;
    osc.connect(bp); bp.connect(gg); gg.connect(env);
  }
  const ns = AC.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true;
  const nf = AC.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = vow[1][0]; nf.Q.value = 2;
  const ng = AC.createGain(); ng.gain.value = 0.5;
  ns.connect(nf); nf.connect(ng); ng.connect(env);
  let out = env;
  if (AC.createStereoPanner) {
    const pan = AC.createStereoPanner(); pan.pan.value = clamp((f.cx / IW) * 2 - 1, -0.85, 0.85) * 0.9;
    env.connect(pan); out = pan;
  }
  out.connect(master);
  if (reverb) out.connect(reverb);
  osc.start(t0); lfo.start(t0); ns.start(t0);
  const end = t0 + dur + 0.8;
  osc.stop(end); lfo.stop(end); ns.stop(end);
  voices++;
  setTimeout(() => { voices = Math.max(0, voices - 1); }, (dur + 0.9 + (delay || 0)) * 1000);
  setTimeout(() => { f.talk = Math.max(f.talk, 0.9); }, Math.max(0, (delay || 0) * 1000));
}

function murmurs(now) {
  if (!AC || !soundOn || AC.state !== 'running') return;
  if (now > nextMurmur) {
    nextMurmur = now + 3500 + Math.random() * 4500;
    speak(faces[Math.floor(Math.random() * faces.length)], 0.1, 0);
  }
}

// ---------- interação ----------
function mousePressed() {
  if (!ready) return;
  audioInit();
  const mx = (mouseX - ox) / sc, my = (mouseY - oy) / sc;
  const order = faces.slice().sort((a, b) => Math.hypot(b.px, b.py) - Math.hypot(a.px, a.py));
  let target = null;
  for (let i = order.length - 1; i >= 0; i--) if (hit(order[i], mx, my)) { target = order[i]; break; }
  const RB = 520 * K;
  const near = [];
  for (const f of faces) {
    const dx = f.cx + f.px - mx, dy = f.cy + f.py - my, d = Math.hypot(dx, dy) || 1;
    if (d < RB) {
      const s = 1 - d / RB;
      f.vx += dx / d * 18 * s * K; f.vy += dy / d * 18 * s * K;
      f.vr += (Math.random() * 2 - 1) * 0.22 * s;
      if (f !== target) near.push({ f, d, s });
    }
  }
  if (target) { target.talk = 1; speak(target, 0.8, 0); }
  near.sort((a, b) => a.d - b.d);
  near.slice(0, 5).forEach(({ f, d, s }) => speak(f, 0.1 + 0.35 * s, (d / (700 * K)) * 0.9 + 0.08));
}

function keyPressed() {
  if (key === ' ') {
    audioInit();
    const cx = IW / 2, cy = IH / 2;
    faces.forEach((f, i) => {
      const dx = f.cx - cx, dy = f.cy - cy, d = Math.hypot(dx, dy) || 1;
      f.vx += dx / d * (14 + Math.random() * 10) * K; f.vy += dy / d * (14 + Math.random() * 10) * K;
      f.vr += (Math.random() * 2 - 1) * 0.3;
      speak(f, 0.3, Math.random() * 0.7);
    });
    return false;
  }
  if (key === 'm' || key === 'M') { soundOn = !soundOn; }
  if (key === 'e' || key === 'E') showEyes = !showEyes;
  if (key === 's' || key === 'S') saveCanvas('olhares', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (ready) fit();
}

// ---------- texto no ecrã ----------
function msg(ctx, s) {
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = s.split('\n');
  lines.forEach((l, i) => ctx.fillText(l, width / 2, height / 2 + (i - (lines.length - 1) / 2) * 26));
  ctx.restore();
}

function overlay(ctx, now) {
  const age = (now - startT) / 1000;
  let text = null;
  if (!AC) text = 'clica numa cara para ligar o som  ·  passa o rato pelas caras  ·  ESPAÇO = explosão';
  else if (age < 14) text = 'rato = dispersar  ·  clique = a cara fala  ·  ESPAÇO = explosão  ·  M = som  ·  E = olhos';
  if (!text) return;
  ctx.save();
  ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 28;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  const x = width / 2 - w / 2, y = height - 40;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, 26, 13) : ctx.rect(x, y, w, 26); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText(text, width / 2, y + 13);
  ctx.restore();
}