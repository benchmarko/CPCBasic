/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
  1     1 A    Winnetou I                       Western   0.00   1.30    90
  2     1 A    Winnetou II                      Western   1.30   3.00    90
  3     1 B    Winnetou III                     Western   0.00   1.30    90
  4     1 B    Maenner des Gesetzes             Western   1.30   3.00    90
  5     2 A    Die gefuerchteten Vier           Western   0.00   1.55   115
  6     2 A    Die Comancheros                  Western   1.55   3.28    93
  7     2 B    Das war der Wilde Westen         Western   0.28   2.52   144
  8     3 A    Die Tiefe                        Abenteu   0.00   2.00   120
  9     3 B    Dynamit in gruener Seide         Krimi     0.00   1.25    85
 10     4 A    Tarzans Vergeltung               Abenteu   0.00   1.30    90
 11     4 A    Tarzans Rache                    Abenteu   1.30   2.55    85
 12     4 B    Tarzan und sein Sohn             Abenteu   0.00   1.20    80
 13     4 B    Die schwarze Windmuehle          Agent     1.20   2.53    93
 14     5 A    Liebe, Tod und Teufel            Ritter    0.00   1.35    95
 15     5 A    Das goldene Schwert              Fantasy   1.40   2.55    75
 16     5 B    Die rechte&linke Hand d.Teufel   Western   0.00   1.47   107
 17     5 B    Die roten Teufel von Arizona     Western   1.47   2.59    72
 18     6 A    Ueber den Daechern von Nizza     Krimi     0.00   1.40   100
 19     6 A    Leichte Beute                    Krimi     1.40   3.01    81
 20     6 B    Ivanhoe - der schwarze Ritter    Ritter    0.00   1.43   103
 21     6 B    Jo-Hasch mich,i.bin d.Moerder    Komik     1.47   3.00    73
 22     7 A    Shogun                           Abenteu   0.00   8.00   480
 23     8 A    Ein Mann wie der Teufel          Western   0.00   1.15    75
 24     8 A    Sinola                           Western   1.15   2.40    85
 25     8 B    Fremonts Abenteuer i.d.Wildnis   Abenteu   0.00   1.31    91
 26     8 B    Stossgebet fuer einen Hammer     ???????   1.30   2.59    89
 27     9 A    Zwei glorreiche Halunken         Western   0.00   2.19   139
 28     9 A    Futureworld - Das Land ...       Zukunft   2.19   3.50    91
 29     9 B    Zwei dreckige Halunken           Western   0.00   2.00   120
 30     9 B    Top Job - Diamantenraub in Rio   Krimi     2.01   3.46   105
 31    10 A    U-Boot in Not                    Action    0.00   1.45   105
 32    10 A    Zwei Banditen                    Western   1.46   3.29   103
 33    10 A    Gesucht:Die Frau d.Banditen S.   Western   3.29   4.52    83
 34    10 B    Plattfuss am Nil                 Krimi     0.54   2.37   103
 35    10 B    Django                           Western   2.37   3.59    82
 36    11 A    Die Werner Fend-Story I          Dokum.    0.00   2.13   133
 37    11 A    Die Werner Fend-Story II         Dokum.    2.13   4.00   107
 38    11 B    James Bond : Octopussy           Agent     0.00   2.05   125
 39    11 B    Vier Faeuste f. ein Halleluja    Western   2.06   4.00   114
 40    12 A    Der groesste Sieg des Herkules   Abenteu   0.00   1.23    83
 41    12 A    Feuersturm                       Action    1.28   2.54    86
 42    12 B    Peter Alexander:Charleys Tante   Komik     0.00   1.26    86
 43    12 B    Duell der Gringos                Western   1.26   2.50    84
 44    13 A    Lass laufen Kumpel !             E.Komik   0.00   1.23    83
 45    13 A    Bud Sp.:Buddy haut den Lukas     Fantasy   1.23   2.45    82
 46    13 A    Eine Faust geht nach Westen      Western   2.45   4.11    86
 47    13 B    Der grosse Coup                  Krimi     0.11   1.56   105
 48    13 B    Angst ueber der Stadt            Action    1.56   3.50   114
 49    14 A    Invasion aus dem Weltall         Zukunft   0.00   1.11    71
 50    14 A    Die Filzlaus                     Krimi     1.11   2.32    81
 51    14 A    Niagara                          Krimi     2.33   3.57    84
 52    14 B    Conan der Barbar                 Barbar    0.00   1.51   111
 53    14 B    Krieg der Sterne I               Zukunft   1.51   3.47   116
 54    15 A    Der Besessene                    Western   0.00   2.15   135
 55    15 A    Cleopatra                        ?         2.15   5.09   174
 56    15 B    Westworld                        Zukunft   1.09   2.34    85
 57    15 B    Zorro, der schwarze Raecher      Western   2.34   3.56    82
 58    16 A    Plattfuss in Afrika              Krimi     0.00   1.32    92
 59    16 A    Herbie gross in Fahrt            Komik     1.33   2.58    85
 60    16 A    Excalibur                        Ritter    2.58   5.07   129
 61    16 B    James B.:In toedlicher Mission   Agent     1.07   3.09   122
 62    17 A    Testkassette                     Test      0.00   2.00   120
 63    17 B    Testkassette                     Test      0.00   2.00   120
 64    18 A    Angst ist der Schluessel         Krimi     0.00   1.39    99
 65    18 A    Ein irrer Typ                    Komik     1.40   3.17    97
 66    18 A    Mein Name ist Nobody             Western   3.18   5.08   110
 67    18 B    Rambo I                          Action    2.30   3.56    86
 68    19 A    Mein grosser Freund Shane        Western   0.00   1.59   119
 69    19 A    Heisse Sch                       E         1.59   2.56    57
 70    19 B    Auch ein Sheriff br.mal Hilfe    Western   0.00   1.29    89
 71    19 B    Ator - Herr des Feuers           Barbar    1.30   3.00    90
 72    20 A    Bandolero                        Western   0.00   1.40   100
 73    20 A    Bond:Leben und sterben lassen    Agent     1.40   3.37   117
 74    20 B    Der Graf von Monte Christo       ?         0.38   3.00   142
 75    21 A    Sprengkommando Atlantik          Action    0.00   1.34    94
 76    21 A    Ein Teufelskerl                  Abenteu   1.35   3.00    85
 77    21 B    Der Seeraeuber                   Pirat     0.00   1.20    80
 78    21 B    Der rote Korsar                  Pirat     1.20   2.56    96
 79    22 A    Nobody ist der Groesste          Western   0.00   1.50   110
 80    22 A    Spion zwischen zwei Fronten      Agent     1.50   4.00   130
 81    22 B    Kampfstern Galactica             Zukunft   0.00   1.58   118
 82    22 B    Der Mann mit dem goldenen Colt   Agent     1.58   4.00   122
 83    23 A    Der Marshal                      Western   0.00   2.02   122
 84    23 A    Mit Dynamit&frommen Spruechen    Western   2.05   3.50   105
 85    23 B    Brannigan - Ein Mann aus Stahl   Krimi     0.00   1.48   108
 86    23 B    James Bond : Feuerball           Agent     1.48   3.53   125
 87    24 A    Ein ausgekochtes Schlitzohr      Komik     0.00   1.29    89
 88    24 A    Megaforce                        Action    1.29   2.54    85
 89    24 B    Dreckiges Gold                   Western   0.00   1.27    87
 90    24 B    Balduin, der Heiratsmuffel       Komik     1.28   2.51    83
 91    25 A    Zwei rechnen ab                  Western   0.00   1.57   117
 92    25 A    Warlock                          Western   1.59   3.45   106
 93    25 B    Auch die Engel essen Bohnen      Komik     0.00   1.54   114
 94    25 B    Koenig der Freibeuter            Pirat     2.02   3.56   114
 95    26 A    Der Jaeger von Fall              Heimat    0.00   1.25    85
 96    26 A    Prinz Eisenherz                  Ritter    1.26   3.00    94
 97    26 B    Das suesse Leben des Grafen B.   Komik     0.00   1.27    87
 98    26 B    Der Bomber                       Action    1.28   3.00    92
 99    27 A    Man nannte ihn Hombre            Western   0.00   1.34    94
100    27 A    John Wayne : Big Jake            Western   1.34   3.15   101
101    27 A    Das As der Asse                  Action    3.16   4.53    97
102    27 B    Der Spuerhund                    Krimi     0.54   2.26    92
103    27 B    Vera Cruz                        Western   2.27   3.55    88
104    28 A    Whisky brutal                    Western   0.00   1.36    96
105    28 A    John Wayne : Rio Lobo            Western   1.37   3.24   107
106    28 A    Belmondo : Der Profi I           Action    3.25   5.08   103
107    28 B    Die Rache des Herkules           Abenteu   1.08   2.32    84
108    28 B    Herkules,der Held von Karthago   Abenteu   2.32   3.51    79
109    29 A    Convoy                           Komik     0.00   1.46   106
110    29 A    Sie Hand am Colt                 Western   1.46   3.02    76
111    29 A    Und ewig singen die Waelder      Heimat    3.02   4.32    90
112    29 B    Das Erbe von Bjoerndal           Heimat    0.32   2.00    88
113    29 B    Liebesgruesse aus Moskau         Agent     2.00   4.00   120
114    30 A    Chisum                           Western   0.00   1.46   106
115    30 A    Feuer aus dem All                Zukunft   1.46   3.31   105
116    30 A    Blutiges Elfenbein               Abenteu   3.32   5.54   142
117    30 B    Der Schut                        Abenteu   0.55   2.44   109
118    30 B    Der Mann vom Alamo               Western   2.45   4.00    75
119    31 A    Fahrkarte ins Jenseits           Western   0.00   1.14    74
120    31 A    Die 3000-Meilen Jagd             Action    1.14   2.47    93
121    31 A    Vampire gegen Herkules           Abenteu   2.47   4.05    78
122    31 B    Der Dieb von Bagdad              Fantasy   0.05   1.45   100
123    31 B    Die Nackten und die Toten        Krieg     1.47   3.52   125
124    32 A    Der letzte Zug von Gun Hill      Western   0.00   1.30    90
125    32 A    Testflug zum Saturn              Zukunft   1.30   3.03    93
126    32 A    Herkules - der Raecher von Rom   Abenteu   3.03   4.20    77
127    32 B    Jesse James, Mann ohne Gesetz    Western   0.20   2.02   102
128    32 B    Der weisse Hai II                Action    2.05   3.56   111
129    33 A    Auf eigene Faust                 Western   0.00   1.09    69
130    33 A    Oscar                            Komik     1.10   2.28    78
131    33 A    Gegen alle Flaggen               Pirat     2.28   3.46    78
132    33 B    Rio Bravo                        Western   0.00   2.15   135
133    33 B    Karl May : Unter Geiern          Western   2.15   3.42    87
134    34 A    Ein Fressen fuer die Geier       ?         0.00   1.46   106
135    34 A    Flucht vor dem Tode              Western   1.46   3.04    78
136    34 A    Der Millionen-Coup I             Krimi     3.05   4.27    82
137    34 B    Der Millionen-Coup II            Krimi     0.27   1.59    92
138    34 B    Unternehmen Capricorn            Action    1.59   4.00   121
139    35 A    Ein Kaefer auf Extratour         Komik     0.00   1.32    92
140    35 A    Kommissar X - 3 blaue Panther    Krimi     1.32   2.56    84
141    35 A    Karl May : Der Oelprinz          Western   2.56   4.18    82
142    35 B    Stahljustiz                      ?         0.18   1.42    84
143    35 B    Die schwarze Tulpe               Ritter    1.50   3.39   109
144    36 A    Kommissar X jagt d.roten Tiger   Krimi     0.00   1.26    86
145    36 A    Verschwoerung in Black Oak       Action    1.26   2.50    84
146    36 A    Vom Teufel geritten              Western   2.50   4.07    77
147    36 B    Die fuenf Geaechteten            Western   0.13   1.51    98
148    36 B    Der weisse Hai I                 Action    1.51   3.57   126
149    37 A    Sie nannten ihn Muecke           Action    0.00   1.38    98
150    37 A    Brust oder Keule                 Komik     1.38   3.16    98
151    37 A    Unter der Flagge des Tigers      Pirat     3.16   4.45    89
152    37 B    Donner ueber dem Ind. Ozean      ?         0.45   2.16    91
153    37 B    James Bond 007 jagt Dr. No       Agent     2.16   3.59   103
154    38 A    Aufstand der Apachen             Western   0.00   1.29    89
155    38 A    Kung Fu:Die Tochter d.Meisters   Karate    0.29   2.57   148
156    38 A    Ueber den Todespass              Western   2.58   4.28    90
157    38 B    James Bond : Goldfinger          Agent     0.29   2.12   103
158    38 B    Ein toller Kaefer                Komik     2.13   3.55   102
159    39 A    Rocky I                          Action    0.00   1.52   112
160    39 A    Rocky II                         Action    1.55   3.44   109
161    39 A    Das Schwert des Shogun           Karate    3.44   5.11    87
162    39 B    Cutter duldet keinen Mord        Krimi     1.12   2.40    88
163    39 B    Frankensteins Monster jagen...   Fantasy   2.40   3.53    73
164    40 A    J. Bond:Man lebt nur zweimal     Agent     0.00   1.52   112
165    40 A    J. Bond : Sag niemals nie !      Agent     1.52   4.00   128
166    40 B    Agenten sterben einsam           Action    0.00   2.30   150
167    40 B    Meuterei am Schlangenfluss       Western   2.30   3.57    87
168    41 A    Das Boot I                       Krieg     0.00   1.36    96
169    41 A    Das Boot II                      Krieg     1.36   3.12    96
170    41 A    Das Boot III                     Krieg     3.12   4.49    97
171    41 B    Ursus im Tal der Loewen          Abenteu   0.50   2.19    89
172    41 B    Die tollen Abenteuer des M.L.    Abenteu   2.19   4.00   101
173    42 A    J.P.Belmondo:Der Puppenspieler   Action    0.00   1.26    86
174    42 A    Ursus, der Unbesiegbare          Abenteu   1.28   2.48    80
175    42 A    Das Krokodil und sein Nilpferd   Komik     2.48   4.22    94
176    42 B    Die glorreichen Sieben           Western   0.22   2.22   120
177    42 B    Schiess zurueck, Cowboy          Western   2.22   3.56    94
178    43 A    El Dorado                        Western   0.00   2.02   122
179    43 A    Old Shatterhand                  Western   2.05   4.00   115
180    43 B    Des Koenigs Admiral              ?         0.00   1.56   116
181    43 B    Das Imperium schlaegt zurueck    Zukunft   1.56   3.56   120
182    44 A    U 4000 - Panik unter d. Ozean    Zukunft   0.00   1.29    89
183    44 A    Nackte Gewalt                    Western   1.30   2.54    84
184    44 A    Die Fahrten des Odysseus         Abenteu   2.55   4.34    99
185    44 B    Angriff der Zylonen (2)          Zukunft   0.35   2.17   102
186    44 B    Todfeinde                        Western   2.17   3.53    96
187    45 A    Der Zauberbogen                  Fantasy   0.00   1.29    89
188    45 A    Sie nannten ihn Plattfuss        Krimi     1.31   3.07    96
189    45 A    Der Drachentoeter                Fantasy   3.07   4.53   106
190    45 B    Rambo II : Der Auftrag           Krieg     0.53   2.22    89
191    45 B    Vier Faeuste gegen Rio           Action    2.22   4.00    98
192    46 A    Zwei ausser Rand und Band        ?         0.00   1.50   110
193    46 A    Der Kampfgigant II               Action    1.52   3.24    92
194    46 A    Zwei vom Affen gebissen          ?         3.40   5.04    84
195    46 B    Belmondo : Der Boss              ?         1.05   2.29    84
196    46 B    Iron Angles                      Karate    2.29   4.00    91
197    47 A    Zorro                            Western   0.00   1.46   106
198    47 A    Plattfuss raeumt auf             Krimi     1.46   3.25    99
199    47 A    Zwei Himmelhunde a.d.Weg z.H.    ?         3.25   4.51    86
200    47 B    J.Bond : In toedlicher Mission   Agent     0.52   2.40   108
201    47 B    Django II                        Western   2.40   3.55    75
202    48 A    Die Rueckkehr der Jedi-Ritter    Zukunft   0.00   2.00   120
203    48 A    Conan, der Zerstoerer            Barbar    2.01   3.35    94
204    48 A    Der Grosse m.seinem ausserird.   Fantasy   3.35   5.01    86
205    48 B    Thesus, Held von Hellos          Abenteu   1.02   2.32    90
206    48 B    Mission Terminate                Krieg     2.33   3.55    82
207    49 A    Der Spion, der mich liebte       Agent     0.00   1.48   108
208    49 A    Die Gewaltigen                   ?         1.49   3.16    87
209    49 A    James Bond : Diamantenfieber     Agent     3.16   4.54    98
210    49 B    Der Aussenseiter                 ?         0.54   2.17    83
211    49 B    Zwei Asse trumpfen auf           ?         2.18   3.52    94
212    50 A    Ein Fressen fuer Django          Western   0.00   1.20    80
213    50 A    Saigon Commandos                 ?         1.20   2.46    86
214    50 A    ?                                ?         2.46   4.00    74
215    50 B    Zwei wie Pech und Schwefel       Komik     0.00   1.38    98
216    50 B    Des Teufels Hauptmann            ?         2.15   3.53    98
217    51 A    J.Bond:Im Angesicht des Todes    Agent     0.00   2.05   125
218    51 A    Das toedliche Kommando           ?         2.06   3.54   108
219    51 B    Thunder 3                        ?         0.00   1.24    84
220    51 B    Ausgeloescht                     ?         1.24   2.51    87
221    52 A    Rambo III                        Krieg     0.00   1.34    94
222    52 A    Aliens II - Die Rueckkehr        Zukunft   1.52   4.00   128
223    52 B    Haengt ihn hoeher                Western   0.00   1.51   111
224    52 B    Sabota                           ?         1.52   3.58   126
225    53 A    Rocky III                        Action    0.00   1.34    94
226    53 A    Der Untergang Roms               ?         1.34   3.00    86
227    53 B    Der Greifer                      ?         0.00   1.36    96
228    53 B    American Fighter II              Karate    1.36   3.00    84
*/ });
