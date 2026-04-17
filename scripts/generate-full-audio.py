#!/usr/bin/env python3
"""
Generate full narrated audio guides for Teotihuacan Tour.
- Writes audioScript to pois.json (300-500 words per POI per language)
- Generates 30 MP3 files using edge-tts
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import edge_tts

VOICES = {
    "es": "es-MX-DaliaNeural",
    "en": "en-US-JennyNeural",
    "pt": "pt-BR-FranciscaNeural",
}

BASE_DIR = Path(__file__).resolve().parent.parent
POIS_PATH = BASE_DIR / "public" / "data" / "pois.json"
AUDIO_DIR = BASE_DIR / "public" / "audio"

# ── Full narration scripts ──────────────────────────────────────────────

SCRIPTS = {
    "puerta-1": {
        "es": (
            "Bienvenidos a Teotihuacán, una de las ciudades más extraordinarias que jamás haya existido en el continente americano. "
            "Se encuentran ustedes en la Puerta 1, la entrada principal a esta zona arqueológica declarada Patrimonio de la Humanidad por la UNESCO en 1987. "
            "Antes de dar sus primeros pasos por este lugar sagrado, permítanme compartir con ustedes un poco de contexto sobre lo que están a punto de descubrir.\n\n"
            "Teotihuacán significa 'el lugar donde los hombres se convierten en dioses' en lengua náhuatl. "
            "Sin embargo, este nombre fue dado por los aztecas siglos después de que la ciudad fuera abandonada. "
            "El nombre original que sus habitantes le dieron permanece como uno de los grandes misterios de la arqueología mexicana. "
            "De hecho, ni siquiera sabemos con certeza qué pueblo la construyó.\n\n"
            "Lo que sí sabemos es impresionante. Esta ciudad fue fundada alrededor del año 100 antes de Cristo y alcanzó su máximo esplendor entre los años 250 y 550 de nuestra era. "
            "En su apogeo, Teotihuacán albergó a más de 100,000 habitantes, convirtiéndola en la sexta ciudad más grande del mundo en ese momento, "
            "comparable en tamaño a la Roma imperial. Sus habitantes desarrollaron un sofisticado sistema urbano con calles trazadas en cuadrícula, "
            "sistemas de drenaje, complejos habitacionales multifamiliares y una red comercial que se extendía hasta Guatemala y más allá.\n\n"
            "La zona arqueológica que visitarán hoy cubre aproximadamente 83 kilómetros cuadrados, aunque solo una fracción ha sido excavada. "
            "El recorrido principal sigue la Calzada de los Muertos, el gran eje norte-sur que conecta los monumentos más importantes: "
            "La Ciudadela, la Pirámide del Sol, la Pirámide de la Luna y numerosos templos y palacios.\n\n"
            "Les recomiendo llevar agua, protector solar y calzado cómodo. El recorrido completo puede tomar entre tres y cinco horas. "
            "Están a 2,300 metros de altitud, así que tómense su tiempo, especialmente al subir las pirámides. "
            "Adelante, comencemos este viaje a través de una de las civilizaciones más fascinantes de la historia."
        ),
        "en": (
            "Welcome to Teotihuacán, one of the most extraordinary cities ever to exist on the American continent. "
            "You are standing at Gate 1, the main entrance to this archaeological zone declared a UNESCO World Heritage Site in 1987. "
            "Before you take your first steps into this sacred place, allow me to share some context about what you are about to discover.\n\n"
            "Teotihuacán means 'the place where men become gods' in the Nahuatl language. "
            "However, this name was given by the Aztecs centuries after the city had been abandoned. "
            "The original name its inhabitants gave it remains one of the great mysteries of Mexican archaeology. "
            "In fact, we do not even know with certainty which people built it.\n\n"
            "What we do know is impressive. This city was founded around 100 BCE and reached its peak between 250 and 550 CE. "
            "At its height, Teotihuacán housed over 100,000 inhabitants, making it the sixth-largest city in the world at that time, "
            "comparable in size to imperial Rome. Its people developed a sophisticated urban system with grid-planned streets, "
            "drainage systems, multi-family housing complexes, and a trade network extending as far as Guatemala and beyond.\n\n"
            "The archaeological zone you will visit today covers approximately 83 square kilometers, though only a fraction has been excavated. "
            "The main route follows the Avenue of the Dead, the great north-south axis connecting the most important monuments: "
            "The Citadel, the Pyramid of the Sun, the Pyramid of the Moon, and numerous temples and palaces.\n\n"
            "I recommend bringing water, sunscreen, and comfortable footwear. The full tour can take between three and five hours. "
            "You are at 2,300 meters above sea level, so take your time, especially when climbing the pyramids. "
            "Let us begin this journey through one of the most fascinating civilizations in history."
        ),
        "pt": (
            "Bem-vindos a Teotihuacán, uma das cidades mais extraordinárias que já existiram no continente americano. "
            "Vocês estão na Porta 1, a entrada principal desta zona arqueológica declarada Patrimônio da Humanidade pela UNESCO em 1987. "
            "Antes de darem seus primeiros passos por este lugar sagrado, permitam-me compartilhar um pouco de contexto sobre o que estão prestes a descobrir.\n\n"
            "Teotihuacán significa 'o lugar onde os homens se tornam deuses' na língua náhuatl. "
            "No entanto, este nome foi dado pelos astecas séculos depois de a cidade ter sido abandonada. "
            "O nome original que seus habitantes lhe deram permanece como um dos grandes mistérios da arqueologia mexicana. "
            "De fato, nem sequer sabemos com certeza qual povo a construiu.\n\n"
            "O que sabemos é impressionante. Esta cidade foi fundada por volta do ano 100 antes de Cristo e alcançou seu máximo esplendor entre os anos 250 e 550 da nossa era. "
            "Em seu apogeu, Teotihuacán abrigou mais de 100.000 habitantes, tornando-a a sexta maior cidade do mundo naquela época, "
            "comparável em tamanho à Roma imperial. Seus habitantes desenvolveram um sofisticado sistema urbano com ruas traçadas em grade, "
            "sistemas de drenagem, complexos habitacionais multifamiliares e uma rede comercial que se estendia até a Guatemala e além.\n\n"
            "A zona arqueológica que visitarão hoje cobre aproximadamente 83 quilômetros quadrados, embora apenas uma fração tenha sido escavada. "
            "O percurso principal segue a Calçada dos Mortos, o grande eixo norte-sul que conecta os monumentos mais importantes: "
            "A Cidadela, a Pirâmide do Sol, a Pirâmide da Lua e numerosos templos e palácios.\n\n"
            "Recomendo levar água, protetor solar e calçado confortável. O percurso completo pode levar entre três e cinco horas. "
            "Vocês estão a 2.300 metros de altitude, então tomem seu tempo, especialmente ao subir as pirâmides. "
            "Vamos começar esta viagem através de uma das civilizações mais fascinantes da história."
        ),
    },
    "ciudadela": {
        "es": (
            "Nos encontramos ahora en La Ciudadela, uno de los conjuntos arquitectónicos más impresionantes de Teotihuacán. "
            "Este enorme recinto ceremonial fue construido alrededor del año 200 de nuestra era y su nombre, dado por los españoles en el siglo XVI, "
            "refleja su apariencia de fortaleza, aunque en realidad cumplía funciones religiosas y políticas.\n\n"
            "Observen las dimensiones de este espacio. Estamos parados dentro de un patio hundido que mide aproximadamente 400 metros por lado, "
            "rodeado por cuatro plataformas elevadas que sostienen un total de quince pirámides menores. "
            "Se estima que este gran espacio podía albergar a más de 100,000 personas durante las ceremonias públicas, "
            "prácticamente toda la población de la ciudad reunida en un solo lugar.\n\n"
            "La Ciudadela servía muy probablemente como el centro político y administrativo de Teotihuacán. "
            "Los arqueólogos han encontrado evidencia de complejos residenciales de la élite gobernante en los flancos norte y sur del recinto. "
            "Estos no eran hogares comunes; contenían pinturas murales elaboradas, pisos de estuco pulido y sistemas de drenaje sofisticados "
            "que demuestran el alto nivel de vida de la clase dirigente.\n\n"
            "En el centro del lado oriental se alza el edificio más importante de este conjunto: el Templo de la Serpiente Emplumada, "
            "que visitaremos a continuación. Pero antes, noten cómo la disposición arquitectónica de La Ciudadela "
            "refleja la cosmovisión teotihuacana. Los cuatro lados representan los cuatro rumbos del universo, "
            "y el templo central simboliza el axis mundi, el punto de conexión entre el cielo, la tierra y el inframundo.\n\n"
            "Investigaciones recientes sugieren que La Ciudadela fue remodelada varias veces a lo largo de los siglos, "
            "lo que indica que este espacio mantuvo su importancia ceremonial durante toda la historia de la ciudad. "
            "Algunos investigadores creen que aquí se llevaban a cabo las ceremonias de investidura de los gobernantes "
            "y los rituales asociados con el calendario sagrado de 260 días."
        ),
        "en": (
            "We are now standing in The Citadel, one of the most impressive architectural complexes in Teotihuacán. "
            "This enormous ceremonial enclosure was built around 200 CE, and its name, given by the Spanish in the sixteenth century, "
            "reflects its fortress-like appearance, although it actually served religious and political functions.\n\n"
            "Observe the dimensions of this space. We are standing inside a sunken courtyard measuring approximately 400 meters per side, "
            "surrounded by four elevated platforms supporting a total of fifteen smaller pyramids. "
            "It is estimated that this great space could hold over 100,000 people during public ceremonies, "
            "virtually the entire population of the city gathered in a single place.\n\n"
            "The Citadel most likely served as the political and administrative center of Teotihuacán. "
            "Archaeologists have found evidence of residential complexes belonging to the ruling elite on the north and south flanks of the enclosure. "
            "These were no ordinary homes; they contained elaborate mural paintings, polished stucco floors, and sophisticated drainage systems "
            "demonstrating the high standard of living enjoyed by the ruling class.\n\n"
            "At the center of the eastern side rises the most important building in this complex: the Temple of the Feathered Serpent, "
            "which we will visit next. But first, notice how the architectural layout of The Citadel "
            "reflects the Teotihuacán worldview. The four sides represent the four directions of the universe, "
            "and the central temple symbolizes the axis mundi, the point of connection between heaven, earth, and the underworld.\n\n"
            "Recent research suggests The Citadel was remodeled several times over the centuries, "
            "indicating that this space maintained its ceremonial importance throughout the city's history. "
            "Some researchers believe that ruler investiture ceremonies and rituals associated with the sacred 260-day calendar "
            "were performed here."
        ),
        "pt": (
            "Estamos agora na Cidadela, um dos conjuntos arquitetônicos mais impressionantes de Teotihuacán. "
            "Este enorme recinto cerimonial foi construído por volta do ano 200 da nossa era, e seu nome, dado pelos espanhóis no século XVI, "
            "reflete sua aparência de fortaleza, embora na realidade cumprisse funções religiosas e políticas.\n\n"
            "Observem as dimensões deste espaço. Estamos dentro de um pátio rebaixado que mede aproximadamente 400 metros de lado, "
            "cercado por quatro plataformas elevadas que sustentam um total de quinze pirâmides menores. "
            "Estima-se que este grande espaço podia abrigar mais de 100.000 pessoas durante as cerimônias públicas, "
            "praticamente toda a população da cidade reunida em um só lugar.\n\n"
            "A Cidadela servia muito provavelmente como o centro político e administrativo de Teotihuacán. "
            "Os arqueólogos encontraram evidências de complexos residenciais da elite governante nos flancos norte e sul do recinto. "
            "Estas não eram casas comuns; continham pinturas murais elaboradas, pisos de estuque polido e sistemas de drenagem sofisticados "
            "que demonstram o alto nível de vida da classe dirigente.\n\n"
            "No centro do lado oriental ergue-se o edifício mais importante deste conjunto: o Templo da Serpente Emplumada, "
            "que visitaremos a seguir. Mas antes, notem como a disposição arquitetônica da Cidadela "
            "reflete a cosmovisão teotihuacana. Os quatro lados representam os quatro rumos do universo, "
            "e o templo central simboliza o axis mundi, o ponto de conexão entre o céu, a terra e o submundo.\n\n"
            "Pesquisas recentes sugerem que a Cidadela foi remodelada várias vezes ao longo dos séculos, "
            "o que indica que este espaço manteve sua importância cerimonial durante toda a história da cidade. "
            "Alguns pesquisadores acreditam que aqui se realizavam as cerimônias de investidura dos governantes "
            "e os rituais associados ao calendário sagrado de 260 dias."
        ),
    },
    "templo-quetzalcoatl": {
        "es": (
            "Estamos frente al Templo de la Serpiente Emplumada, también conocido como Templo de Quetzalcóatl, "
            "uno de los edificios más extraordinarios y ricamente decorados de toda Mesoamérica. "
            "Este templo, construido alrededor del año 200 de nuestra era, es un testimonio del poder artístico y ritual de Teotihuacán.\n\n"
            "Observen la fachada con atención. Pueden ver dos tipos de esculturas que se alternan: "
            "las cabezas de serpientes emplumadas, con sus cuerpos ondulantes decorados con plumas y conchas, "
            "y los tocados circulares que durante mucho tiempo se identificaron como representaciones de Tláloc, el dios de la lluvia. "
            "Sin embargo, investigaciones más recientes sugieren que estos tocados podrían representar a la Serpiente de Guerra, "
            "un símbolo asociado con el poder militar. Cada nivel de la pirámide repite este patrón de manera hipnótica, "
            "creando un efecto visual que debió ser abrumador cuando las esculturas conservaban sus colores originales "
            "en rojo, verde, azul y blanco.\n\n"
            "Pero lo más impactante de este templo se encuentra debajo de su superficie. "
            "Durante excavaciones realizadas entre 1980 y 2004, los arqueólogos descubrieron los restos de más de 200 individuos "
            "enterrados bajo y alrededor de la estructura. Estos no fueron entierros comunes: "
            "los cuerpos estaban dispuestos en grupos organizados, muchos con las manos atadas a la espalda, "
            "acompañados de ofrendas que incluían collares de conchas en forma de mandíbulas humanas, "
            "figurillas de jade, puntas de proyectil de obsidiana y ornamentos de pirita.\n\n"
            "Los investigadores creen que estos sacrificios masivos se realizaron durante la consagración del templo "
            "y estaban relacionados con la creación del tiempo y el cosmos en la mitología teotihuacana. "
            "Los cuerpos fueron colocados en posiciones que corresponden a los puntos cardinales, "
            "sugiriendo que cada sacrificio tenía un significado cosmológico específico.\n\n"
            "En 2003 se descubrió un túnel que corre debajo del templo, a 15 metros de profundidad, "
            "que contenía miles de objetos rituales incluyendo semillas, conchas marinas, cristales de cuarzo "
            "y representaciones en miniatura de paisajes montañosos. Este túnel ha sido interpretado como "
            "una representación simbólica del inframundo."
        ),
        "en": (
            "We are standing before the Temple of the Feathered Serpent, also known as the Temple of Quetzalcóatl, "
            "one of the most extraordinary and richly decorated buildings in all of Mesoamerica. "
            "This temple, built around 200 CE, is a testament to the artistic and ritual power of Teotihuacán.\n\n"
            "Look closely at the facade. You can see two types of sculptures alternating: "
            "the heads of feathered serpents, with their undulating bodies decorated with feathers and shells, "
            "and the circular headdresses long identified as representations of Tláloc, the rain god. "
            "However, more recent research suggests these headdresses may represent the War Serpent, "
            "a symbol associated with military power. Each level of the pyramid repeats this pattern hypnotically, "
            "creating a visual effect that must have been overwhelming when the sculptures retained their original colors "
            "in red, green, blue, and white.\n\n"
            "But the most striking aspect of this temple lies beneath its surface. "
            "During excavations conducted between 1980 and 2004, archaeologists discovered the remains of over 200 individuals "
            "buried beneath and around the structure. These were no ordinary burials: "
            "the bodies were arranged in organized groups, many with their hands tied behind their backs, "
            "accompanied by offerings that included necklaces of shells shaped like human jaws, "
            "jade figurines, obsidian projectile points, and pyrite ornaments.\n\n"
            "Researchers believe these mass sacrifices were performed during the temple's consecration "
            "and were related to the creation of time and the cosmos in Teotihuacán mythology. "
            "The bodies were placed in positions corresponding to the cardinal points, "
            "suggesting that each sacrifice held specific cosmological meaning.\n\n"
            "In 2003, a tunnel was discovered running beneath the temple at a depth of 15 meters, "
            "containing thousands of ritual objects including seeds, seashells, quartz crystals, "
            "and miniature representations of mountainous landscapes. This tunnel has been interpreted as "
            "a symbolic representation of the underworld."
        ),
        "pt": (
            "Estamos diante do Templo da Serpente Emplumada, também conhecido como Templo de Quetzalcóatl, "
            "um dos edifícios mais extraordinários e ricamente decorados de toda a Mesoamérica. "
            "Este templo, construído por volta do ano 200 da nossa era, é um testemunho do poder artístico e ritual de Teotihuacán.\n\n"
            "Observem a fachada com atenção. Podem ver dois tipos de esculturas que se alternam: "
            "as cabeças de serpentes emplumadas, com seus corpos ondulantes decorados com penas e conchas, "
            "e os adornos circulares que durante muito tempo foram identificados como representações de Tláloc, o deus da chuva. "
            "No entanto, pesquisas mais recentes sugerem que esses adornos poderiam representar a Serpente de Guerra, "
            "um símbolo associado ao poder militar. Cada nível da pirâmide repete esse padrão de forma hipnótica, "
            "criando um efeito visual que devia ser avassalador quando as esculturas conservavam suas cores originais "
            "em vermelho, verde, azul e branco.\n\n"
            "Mas o mais impactante deste templo encontra-se abaixo de sua superfície. "
            "Durante escavações realizadas entre 1980 e 2004, os arqueólogos descobriram os restos de mais de 200 indivíduos "
            "enterrados sob e ao redor da estrutura. Estes não foram enterros comuns: "
            "os corpos estavam dispostos em grupos organizados, muitos com as mãos amarradas nas costas, "
            "acompanhados de oferendas que incluíam colares de conchas em forma de mandíbulas humanas, "
            "figurinhas de jade, pontas de projétil de obsidiana e ornamentos de pirita.\n\n"
            "Os pesquisadores acreditam que esses sacrifícios massivos foram realizados durante a consagração do templo "
            "e estavam relacionados com a criação do tempo e do cosmos na mitologia teotihuacana. "
            "Os corpos foram colocados em posições que correspondem aos pontos cardeais, "
            "sugerindo que cada sacrifício tinha um significado cosmológico específico.\n\n"
            "Em 2003, foi descoberto um túnel que corre abaixo do templo, a 15 metros de profundidade, "
            "contendo milhares de objetos rituais incluindo sementes, conchas marinhas, cristais de quartzo "
            "e representações em miniatura de paisagens montanhosas. Este túnel foi interpretado como "
            "uma representação simbólica do submundo."
        ),
    },
    "calzada-muertos": {
        "es": (
            "Nos encontramos caminando por la Calzada de los Muertos, la avenida más importante de Teotihuacán "
            "y el eje central sobre el cual fue planificada toda la ciudad. "
            "Esta impresionante vía se extiende por más de 2 kilómetros en dirección norte-sur, "
            "desde La Ciudadela hasta la Plaza de la Luna, con un ancho que alcanza los 40 metros en algunos tramos.\n\n"
            "El nombre Calzada de los Muertos, o Miccaotli en náhuatl, fue dado por los aztecas cuando llegaron a estas ruinas "
            "alrededor del siglo XIV. Al ver las plataformas rectangulares que flanquean la avenida, "
            "creyeron que eran tumbas de antiguos reyes y dioses. En realidad, estas plataformas sostenían templos y edificios ceremoniales, "
            "pero el nombre se quedó y es el que usamos hasta hoy.\n\n"
            "Lo que resulta extraordinario de esta avenida es su planificación urbana. "
            "Teotihuacán fue una de las primeras ciudades del mundo antiguo diseñada con un plan maestro riguroso. "
            "La Calzada está orientada a 15 grados y medio al este del norte geográfico, "
            "una desviación intencional que los arqueólogos creen que está relacionada con eventos astronómicos, "
            "posiblemente la puesta del sol el día que pasa por el cenit.\n\n"
            "A medida que caminamos, observen que la avenida no es plana. Está dividida en secciones separadas por muros transversales "
            "que crean diferentes niveles, como escalones gigantes. Esto genera un efecto dramático: "
            "al caminar hacia el norte, la Pirámide de la Luna parece crecer gradualmente ante sus ojos, "
            "un efecto teatral cuidadosamente calculado por los arquitectos teotihuacanos.\n\n"
            "A ambos lados de la Calzada se levantan conjuntos arquitectónicos que incluían templos, residencias de la élite "
            "y talleres artesanales. Muchos de estos edificios conservan restos de pintura mural en tonos rojos, "
            "lo que nos permite imaginar cómo lucía esta avenida en su época de esplendor: "
            "una procesión de edificios coloridos enmarcando la vista hacia las grandes pirámides. "
            "Era, sin duda, una de las vistas urbanas más espectaculares del mundo antiguo."
        ),
        "en": (
            "We are now walking along the Avenue of the Dead, the most important thoroughfare in Teotihuacán "
            "and the central axis upon which the entire city was planned. "
            "This impressive road stretches over 2 kilometers in a north-south direction, "
            "from The Citadel to the Plaza of the Moon, with a width reaching 40 meters in some sections.\n\n"
            "The name Avenue of the Dead, or Miccaotli in Nahuatl, was given by the Aztecs when they arrived at these ruins "
            "around the fourteenth century. Upon seeing the rectangular platforms flanking the avenue, "
            "they believed them to be tombs of ancient kings and gods. In reality, these platforms supported temples and ceremonial buildings, "
            "but the name stuck and is the one we use to this day.\n\n"
            "What is extraordinary about this avenue is its urban planning. "
            "Teotihuacán was one of the first cities in the ancient world designed with a rigorous master plan. "
            "The Avenue is oriented 15 and a half degrees east of geographic north, "
            "an intentional deviation that archaeologists believe is related to astronomical events, "
            "possibly the sunset on the day the sun passes through the zenith.\n\n"
            "As we walk, notice that the avenue is not flat. It is divided into sections separated by transverse walls "
            "creating different levels, like giant steps. This produces a dramatic effect: "
            "as you walk northward, the Pyramid of the Moon appears to grow gradually before your eyes, "
            "a theatrical effect carefully calculated by Teotihuacán's architects.\n\n"
            "On both sides of the Avenue stand architectural complexes that included temples, elite residences, "
            "and artisan workshops. Many of these buildings preserve traces of mural painting in red tones, "
            "allowing us to imagine how this avenue looked in its era of splendor: "
            "a procession of colorful buildings framing the view toward the great pyramids. "
            "It was, without a doubt, one of the most spectacular urban vistas in the ancient world."
        ),
        "pt": (
            "Estamos agora caminhando pela Calçada dos Mortos, a avenida mais importante de Teotihuacán "
            "e o eixo central sobre o qual toda a cidade foi planejada. "
            "Esta impressionante via se estende por mais de 2 quilômetros na direção norte-sul, "
            "desde A Cidadela até a Praça da Lua, com uma largura que alcança 40 metros em alguns trechos.\n\n"
            "O nome Calçada dos Mortos, ou Miccaotli em náhuatl, foi dado pelos astecas quando chegaram a estas ruínas "
            "por volta do século XIV. Ao ver as plataformas retangulares que ladeiam a avenida, "
            "acreditaram que eram túmulos de antigos reis e deuses. Na realidade, estas plataformas sustentavam templos e edifícios cerimoniais, "
            "mas o nome permaneceu e é o que usamos até hoje.\n\n"
            "O que é extraordinário nesta avenida é seu planejamento urbano. "
            "Teotihuacán foi uma das primeiras cidades do mundo antigo projetada com um plano diretor rigoroso. "
            "A Calçada está orientada a 15 graus e meio ao leste do norte geográfico, "
            "um desvio intencional que os arqueólogos acreditam estar relacionado com eventos astronômicos, "
            "possivelmente o pôr do sol no dia em que o sol passa pelo zênite.\n\n"
            "À medida que caminhamos, observem que a avenida não é plana. Está dividida em seções separadas por muros transversais "
            "que criam diferentes níveis, como degraus gigantes. Isso gera um efeito dramático: "
            "ao caminhar para o norte, a Pirâmide da Lua parece crescer gradualmente diante de seus olhos, "
            "um efeito teatral cuidadosamente calculado pelos arquitetos teotihuacanos.\n\n"
            "Em ambos os lados da Calçada erguem-se conjuntos arquitetônicos que incluíam templos, residências da elite "
            "e oficinas artesanais. Muitos desses edifícios conservam restos de pintura mural em tons vermelhos, "
            "o que nos permite imaginar como esta avenida parecia em sua época de esplendor: "
            "uma procissão de edifícios coloridos emoldurando a vista em direção às grandes pirâmides. "
            "Era, sem dúvida, uma das vistas urbanas mais espetaculares do mundo antigo."
        ),
    },
    "piramide-sol": {
        "es": (
            "Estamos ante la Pirámide del Sol, el edificio más imponente de Teotihuacán y una de las estructuras más grandes "
            "jamás construidas en el mundo antiguo. Con sus 65 metros de altura y una base de 225 metros por lado, "
            "es la tercera pirámide más grande del mundo, solo superada por la Gran Pirámide de Cholula y la de Keops en Giza. "
            "De hecho, su base es casi idéntica en tamaño a la de la pirámide egipcia.\n\n"
            "Esta colosal estructura fue construida en dos fases principales. La primera, alrededor del año 100 de nuestra era, "
            "levantó la mayor parte del volumen que vemos hoy. La segunda fase añadió una plataforma adosada en el frente. "
            "Se estima que su construcción requirió el trabajo de miles de personas durante varias décadas "
            "y el movimiento de aproximadamente un millón de metros cúbicos de material, "
            "incluyendo tierra, adobe y piedra volcánica de la región.\n\n"
            "Uno de los descubrimientos más fascinantes ocurrió en 1971, cuando se encontró una cueva natural debajo de la pirámide. "
            "Esta cueva, que tiene forma de flor de cuatro pétalos, fue modificada artificialmente "
            "y se cree que fue el motivo original por el cual se construyó la pirámide en este lugar exacto. "
            "En muchas culturas mesoamericanas, las cuevas representaban la entrada al inframundo "
            "y el lugar de origen de la humanidad.\n\n"
            "Si deciden subir, lo cual les recomiendo enormemente, encontrarán 248 escalones divididos en cinco cuerpos. "
            "La subida puede tomar entre 15 y 25 minutos dependiendo de su ritmo. "
            "Recuerden que estamos a más de 2,300 metros de altitud, así que es normal sentirse un poco agitado. "
            "Hagan pausas en cada nivel para recuperar el aliento y admirar la vista.\n\n"
            "Desde la cima, la panorámica es absolutamente espectacular. Podrán ver toda la Calzada de los Muertos, "
            "la Pirámide de la Luna al norte, La Ciudadela al sur, y en días claros, "
            "los volcanes Popocatépetl e Iztaccíhuatl en el horizonte. "
            "Es una experiencia que conecta profundamente con la grandeza de esta civilización."
        ),
        "en": (
            "We are standing before the Pyramid of the Sun, the most imposing building in Teotihuacán and one of the largest structures "
            "ever built in the ancient world. At 65 meters tall with a base measuring 225 meters per side, "
            "it is the third-largest pyramid in the world, surpassed only by the Great Pyramid of Cholula and the Pyramid of Khufu at Giza. "
            "In fact, its base is nearly identical in size to that of the Egyptian pyramid.\n\n"
            "This colossal structure was built in two main phases. The first, around 100 CE, "
            "raised most of the volume we see today. The second phase added an attached platform at the front. "
            "It is estimated that its construction required the labor of thousands of people over several decades "
            "and the movement of approximately one million cubic meters of material, "
            "including earth, adobe, and volcanic stone from the region.\n\n"
            "One of the most fascinating discoveries occurred in 1971, when a natural cave was found beneath the pyramid. "
            "This cave, shaped like a four-petaled flower, was artificially modified "
            "and is believed to have been the original reason the pyramid was built at this exact location. "
            "In many Mesoamerican cultures, caves represented the entrance to the underworld "
            "and the place of origin of humanity.\n\n"
            "If you decide to climb, which I highly recommend, you will find 248 steps divided into five levels. "
            "The ascent can take between 15 and 25 minutes depending on your pace. "
            "Remember that we are at over 2,300 meters above sea level, so it is normal to feel a bit winded. "
            "Take breaks at each level to catch your breath and admire the view.\n\n"
            "From the summit, the panorama is absolutely spectacular. You will be able to see the entire Avenue of the Dead, "
            "the Pyramid of the Moon to the north, The Citadel to the south, and on clear days, "
            "the Popocatépetl and Iztaccíhuatl volcanoes on the horizon. "
            "It is an experience that connects you deeply with the grandeur of this civilization."
        ),
        "pt": (
            "Estamos diante da Pirâmide do Sol, o edifício mais imponente de Teotihuacán e uma das maiores estruturas "
            "já construídas no mundo antigo. Com seus 65 metros de altura e uma base de 225 metros de lado, "
            "é a terceira maior pirâmide do mundo, superada apenas pela Grande Pirâmide de Cholula e pela de Quéops em Gizé. "
            "De fato, sua base é quase idêntica em tamanho à da pirâmide egípcia.\n\n"
            "Esta colossal estrutura foi construída em duas fases principais. A primeira, por volta do ano 100 da nossa era, "
            "ergueu a maior parte do volume que vemos hoje. A segunda fase adicionou uma plataforma anexa na frente. "
            "Estima-se que sua construção exigiu o trabalho de milhares de pessoas durante várias décadas "
            "e a movimentação de aproximadamente um milhão de metros cúbicos de material, "
            "incluindo terra, adobe e pedra vulcânica da região.\n\n"
            "Uma das descobertas mais fascinantes ocorreu em 1971, quando uma caverna natural foi encontrada abaixo da pirâmide. "
            "Esta caverna, que tem forma de flor de quatro pétalas, foi modificada artificialmente "
            "e acredita-se que tenha sido o motivo original pelo qual a pirâmide foi construída neste local exato. "
            "Em muitas culturas mesoamericanas, as cavernas representavam a entrada ao submundo "
            "e o lugar de origem da humanidade.\n\n"
            "Se decidirem subir, o que recomendo enormemente, encontrarão 248 degraus divididos em cinco corpos. "
            "A subida pode levar entre 15 e 25 minutos dependendo do seu ritmo. "
            "Lembrem-se de que estamos a mais de 2.300 metros de altitude, então é normal sentir-se um pouco ofegante. "
            "Façam pausas em cada nível para recuperar o fôlego e admirar a vista.\n\n"
            "Do topo, o panorama é absolutamente espetacular. Poderão ver toda a Calçada dos Mortos, "
            "a Pirâmide da Lua ao norte, A Cidadela ao sul, e em dias claros, "
            "os vulcões Popocatépetl e Iztaccíhuatl no horizonte. "
            "É uma experiência que conecta profundamente com a grandeza desta civilização."
        ),
    },
    "piramide-luna": {
        "es": (
            "Hemos llegado a la Pirámide de la Luna, la segunda estructura más grande de Teotihuacán "
            "y posiblemente la más sagrada de toda la ciudad. Con sus 43 metros de altura, "
            "corona majestuosamente el extremo norte de la Calzada de los Muertos, "
            "creando una silueta que se funde con el perfil del Cerro Gordo que se alza detrás de ella. "
            "Esta relación visual no es coincidencia; los teotihuacanos construyeron esta pirámide "
            "para replicar la forma de la montaña sagrada.\n\n"
            "A diferencia de la Pirámide del Sol, que fue construida en una o dos fases, "
            "la Pirámide de la Luna fue el resultado de siete etapas constructivas que se extendieron "
            "desde el año 100 hasta el 450 de nuestra era. Cada nueva fase envolvió a la anterior como una muñeca rusa, "
            "y con cada ampliación se realizaban elaborados rituales de consagración.\n\n"
            "Las excavaciones realizadas entre 1998 y 2004 por un equipo internacional revelaron hallazgos extraordinarios. "
            "En el interior se encontraron múltiples entierros rituales que incluían sacrificios humanos "
            "y de animales considerados sagrados: jaguares, pumas, lobos, águilas y serpientes de cascabel. "
            "Los individuos sacrificados provenían de diferentes regiones de Mesoamérica, "
            "lo que demuestra el alcance del poder de Teotihuacán.\n\n"
            "Entre las ofrendas más impresionantes se encontraron objetos de jade, "
            "espejos de pirita, cuchillos ceremoniales de obsidiana y figurillas de piedra verde "
            "con una calidad artística excepcional. Una de las ofrendas contenía "
            "esqueletos de jaguares y águilas con las garras atadas, "
            "dispuestos en un patrón que simbolizaba la guerra sagrada.\n\n"
            "Actualmente solo se permite subir hasta el primer nivel de la pirámide, "
            "pero incluso desde esa altura, la vista de la Calzada de los Muertos extendiéndose hacia el sur "
            "es una de las imágenes más icónicas de México. "
            "Tómense un momento para contemplar esta perspectiva que ha cautivado a viajeros durante siglos."
        ),
        "en": (
            "We have arrived at the Pyramid of the Moon, the second-largest structure in Teotihuacán "
            "and possibly the most sacred in the entire city. Standing 43 meters tall, "
            "it majestically crowns the northern end of the Avenue of the Dead, "
            "creating a silhouette that blends with the profile of Cerro Gordo rising behind it. "
            "This visual relationship is no coincidence; the Teotihuacanos built this pyramid "
            "to replicate the shape of the sacred mountain.\n\n"
            "Unlike the Pyramid of the Sun, which was built in one or two phases, "
            "the Pyramid of the Moon was the result of seven construction stages spanning "
            "from 100 to 450 CE. Each new phase enveloped the previous one like a Russian nesting doll, "
            "and with each expansion, elaborate consecration rituals were performed.\n\n"
            "Excavations carried out between 1998 and 2004 by an international team revealed extraordinary findings. "
            "Inside, multiple ritual burials were discovered that included human sacrifices "
            "and sacrifices of animals considered sacred: jaguars, pumas, wolves, eagles, and rattlesnakes. "
            "The sacrificed individuals came from different regions of Mesoamerica, "
            "demonstrating the reach of Teotihuacán's power.\n\n"
            "Among the most impressive offerings were jade objects, "
            "pyrite mirrors, ceremonial obsidian knives, and green stone figurines "
            "of exceptional artistic quality. One offering contained "
            "skeletons of jaguars and eagles with their claws bound, "
            "arranged in a pattern symbolizing sacred warfare.\n\n"
            "Currently, climbing is only permitted to the first level of the pyramid, "
            "but even from that height, the view of the Avenue of the Dead stretching southward "
            "is one of Mexico's most iconic images. "
            "Take a moment to contemplate this perspective that has captivated travelers for centuries."
        ),
        "pt": (
            "Chegamos à Pirâmide da Lua, a segunda maior estrutura de Teotihuacán "
            "e possivelmente a mais sagrada de toda a cidade. Com seus 43 metros de altura, "
            "coroa majestosamente o extremo norte da Calçada dos Mortos, "
            "criando uma silhueta que se funde com o perfil do Cerro Gordo que se ergue atrás dela. "
            "Esta relação visual não é coincidência; os teotihuacanos construíram esta pirâmide "
            "para replicar a forma da montanha sagrada.\n\n"
            "Diferente da Pirâmide do Sol, que foi construída em uma ou duas fases, "
            "a Pirâmide da Lua foi resultado de sete etapas construtivas que se estenderam "
            "do ano 100 ao 450 da nossa era. Cada nova fase envolveu a anterior como uma boneca russa, "
            "e com cada ampliação realizavam-se elaborados rituais de consagração.\n\n"
            "As escavações realizadas entre 1998 e 2004 por uma equipe internacional revelaram achados extraordinários. "
            "No interior foram encontrados múltiplos enterros rituais que incluíam sacrifícios humanos "
            "e de animais considerados sagrados: jaguares, pumas, lobos, águias e cascavéis. "
            "Os indivíduos sacrificados provinham de diferentes regiões da Mesoamérica, "
            "o que demonstra o alcance do poder de Teotihuacán.\n\n"
            "Entre as oferendas mais impressionantes foram encontrados objetos de jade, "
            "espelhos de pirita, facas cerimoniais de obsidiana e figurinhas de pedra verde "
            "com uma qualidade artística excepcional. Uma das oferendas continha "
            "esqueletos de jaguares e águias com as garras amarradas, "
            "dispostos em um padrão que simbolizava a guerra sagrada.\n\n"
            "Atualmente só é permitido subir até o primeiro nível da pirâmide, "
            "mas mesmo dessa altura, a vista da Calçada dos Mortos se estendendo para o sul "
            "é uma das imagens mais icônicas do México. "
            "Tomem um momento para contemplar esta perspectiva que tem cativado viajantes durante séculos."
        ),
    },
    "plaza-luna": {
        "es": (
            "Nos encontramos en la Plaza de la Luna, una amplia explanada ceremonial que se extiende frente a la Pirámide de la Luna. "
            "Este es uno de los espacios más impresionantes de Teotihuacán y un lugar donde la arquitectura, "
            "la astronomía y la religión se fusionan de manera magistral.\n\n"
            "La plaza está delimitada por doce plataformas de templos dispuestas simétricamente a ambos lados, "
            "creando un espacio sagrado de proporciones perfectas. En el centro pueden ver un altar cuadrangular "
            "que servía como escenario principal para los rituales públicos. "
            "Imaginen este espacio hace mil quinientos años, lleno de miles de personas "
            "presenciando ceremonias que involucraban música, danza, incienso y ofrendas a los dioses.\n\n"
            "Desde esta plaza se obtiene una de las perspectivas más fotografiadas de México: "
            "la vista sur a lo largo de la Calzada de los Muertos con la Pirámide del Sol dominando el paisaje a la derecha. "
            "Esta vista no es accidental. Los arquitectos teotihuacanos diseñaron este espacio "
            "para crear una experiencia visual y espiritual específica. "
            "Al estar parado en el centro de la plaza, uno se siente rodeado por la presencia de los templos "
            "y dominado por la masa imponente de la Pirámide de la Luna.\n\n"
            "Los arqueólogos han determinado que la plaza fue remodelada varias veces para mantener su simetría "
            "a medida que la Pirámide de la Luna crecía en cada nueva fase constructiva. "
            "Esto demuestra la importancia que los teotihuacanos otorgaban a la armonía visual y espacial "
            "de sus espacios ceremoniales.\n\n"
            "Un dato fascinante: estudios acústicos recientes han demostrado que la plaza tiene propiedades "
            "de amplificación del sonido. Una persona hablando desde el altar central "
            "podía ser escuchada claramente por miles de personas en la plaza, "
            "sin necesidad de ningún tipo de amplificación artificial. "
            "Los teotihuacanos eran, entre muchas otras cosas, brillantes ingenieros acústicos."
        ),
        "en": (
            "We are standing in the Plaza of the Moon, a vast ceremonial esplanade stretching before the Pyramid of the Moon. "
            "This is one of the most impressive spaces in Teotihuacán and a place where architecture, "
            "astronomy, and religion merge in masterful fashion.\n\n"
            "The plaza is bordered by twelve temple platforms arranged symmetrically on both sides, "
            "creating a sacred space of perfect proportions. At the center you can see a quadrangular altar "
            "that served as the main stage for public rituals. "
            "Imagine this space fifteen hundred years ago, filled with thousands of people "
            "witnessing ceremonies involving music, dance, incense, and offerings to the gods.\n\n"
            "From this plaza you get one of the most photographed perspectives in Mexico: "
            "the southward view along the Avenue of the Dead with the Pyramid of the Sun dominating the landscape to the right. "
            "This view is no accident. Teotihuacán's architects designed this space "
            "to create a specific visual and spiritual experience. "
            "Standing at the center of the plaza, you feel surrounded by the presence of the temples "
            "and dominated by the imposing mass of the Pyramid of the Moon.\n\n"
            "Archaeologists have determined that the plaza was remodeled several times to maintain its symmetry "
            "as the Pyramid of the Moon grew with each new construction phase. "
            "This demonstrates the importance the Teotihuacanos placed on the visual and spatial harmony "
            "of their ceremonial spaces.\n\n"
            "A fascinating fact: recent acoustic studies have shown that the plaza possesses "
            "sound amplification properties. A person speaking from the central altar "
            "could be heard clearly by thousands of people in the plaza "
            "without any form of artificial amplification. "
            "The Teotihuacanos were, among many other things, brilliant acoustic engineers."
        ),
        "pt": (
            "Estamos na Praça da Lua, uma ampla esplanada cerimonial que se estende diante da Pirâmide da Lua. "
            "Este é um dos espaços mais impressionantes de Teotihuacán e um lugar onde a arquitetura, "
            "a astronomia e a religião se fundem de maneira magistral.\n\n"
            "A praça é delimitada por doze plataformas de templos dispostas simetricamente em ambos os lados, "
            "criando um espaço sagrado de proporções perfeitas. No centro podem ver um altar quadrangular "
            "que servia como palco principal para os rituais públicos. "
            "Imaginem este espaço há mil e quinhentos anos, cheio de milhares de pessoas "
            "presenciando cerimônias que envolviam música, dança, incenso e oferendas aos deuses.\n\n"
            "Desta praça se obtém uma das perspectivas mais fotografadas do México: "
            "a vista sul ao longo da Calçada dos Mortos com a Pirâmide do Sol dominando a paisagem à direita. "
            "Esta vista não é acidental. Os arquitetos teotihuacanos projetaram este espaço "
            "para criar uma experiência visual e espiritual específica. "
            "Ao estar no centro da praça, sentimo-nos rodeados pela presença dos templos "
            "e dominados pela massa imponente da Pirâmide da Lua.\n\n"
            "Os arqueólogos determinaram que a praça foi remodelada várias vezes para manter sua simetria "
            "à medida que a Pirâmide da Lua crescia em cada nova fase construtiva. "
            "Isso demonstra a importância que os teotihuacanos davam à harmonia visual e espacial "
            "de seus espaços cerimoniais.\n\n"
            "Um dado fascinante: estudos acústicos recentes demonstraram que a praça possui propriedades "
            "de amplificação do som. Uma pessoa falando desde o altar central "
            "podia ser ouvida claramente por milhares de pessoas na praça, "
            "sem necessidade de nenhum tipo de amplificação artificial. "
            "Os teotihuacanos eram, entre muitas outras coisas, brilhantes engenheiros acústicos."
        ),
    },
    "palacio-quetzalpapalotl": {
        "es": (
            "Bienvenidos al Palacio de Quetzalpapálotl, una de las joyas arquitectónicas más refinadas de Teotihuacán "
            "y uno de los complejos residenciales mejor conservados del México prehispánico. "
            "Su nombre combina dos palabras náhuatl: quetzal, el ave de plumas preciosas, "
            "y papálotl, que significa mariposa. El quetzal-mariposa era una criatura mítica "
            "que simbolizaba la transformación y la conexión entre el mundo terrenal y el divino.\n\n"
            "Este palacio fue la residencia de los sacerdotes de más alto rango en la jerarquía teotihuacana. "
            "Fue construido alrededor del año 450 de nuestra era, durante la última gran época de esplendor de la ciudad. "
            "Lo que hace único a este lugar son sus extraordinarios pilares tallados.\n\n"
            "Observen con detenimiento las columnas del patio central. Cada una está decorada con bajorrelieves "
            "que representan al quetzal-mariposa visto de frente, con las alas extendidas. "
            "Los ojos de estas criaturas están hechos con incrustaciones de obsidiana que originalmente brillaban "
            "reflejando la luz del sol que entraba al patio. Los bordes de las alas y los cuerpos "
            "conservan rastros de pintura en rojo, verde y amarillo, "
            "dándonos una idea de la explosión cromática que debió ser este espacio.\n\n"
            "El sistema constructivo del palacio es notable. Los techos estaban hechos de gruesas losas de piedra "
            "sostenidas por las columnas talladas, creando un espacio interior fresco y sombreado, "
            "ideal para el clima cálido del valle. El piso era de estuco pulido, "
            "tan liso que casi parecía mármol, y las paredes estaban cubiertas de murales.\n\n"
            "Debajo de este palacio se encuentra una estructura más antigua conocida como el Templo de los Caracoles Emplumados, "
            "que data de una época anterior. Algunos de sus elementos decorativos, "
            "incluyendo representaciones de caracoles marinos adornados con plumas, "
            "son visibles en la parte baja del complejo y revelan las múltiples capas de historia "
            "que se acumulan en cada rincón de Teotihuacán."
        ),
        "en": (
            "Welcome to the Palace of Quetzalpapalotl, one of the most refined architectural gems of Teotihuacán "
            "and one of the best-preserved residential complexes in pre-Hispanic Mexico. "
            "Its name combines two Nahuatl words: quetzal, the bird with precious feathers, "
            "and papálotl, meaning butterfly. The quetzal-butterfly was a mythical creature "
            "symbolizing transformation and the connection between the earthly and divine worlds.\n\n"
            "This palace was the residence of the highest-ranking priests in Teotihuacán's hierarchy. "
            "It was built around 450 CE, during the city's last great era of splendor. "
            "What makes this place unique are its extraordinary carved pillars.\n\n"
            "Look carefully at the columns of the central courtyard. Each one is decorated with bas-reliefs "
            "depicting the quetzal-butterfly seen from the front, with wings spread. "
            "The eyes of these creatures are made with obsidian inlays that originally shimmered "
            "reflecting the sunlight entering the courtyard. The edges of the wings and bodies "
            "preserve traces of paint in red, green, and yellow, "
            "giving us an idea of the chromatic explosion this space must have been.\n\n"
            "The palace's construction system is remarkable. The roofs were made of thick stone slabs "
            "supported by the carved columns, creating a cool, shaded interior space "
            "ideal for the valley's warm climate. The floor was polished stucco, "
            "so smooth it almost resembled marble, and the walls were covered in murals.\n\n"
            "Beneath this palace lies an older structure known as the Temple of the Feathered Shells, "
            "dating from an earlier period. Some of its decorative elements, "
            "including representations of seashells adorned with feathers, "
            "are visible in the lower part of the complex and reveal the multiple layers of history "
            "that accumulate in every corner of Teotihuacán."
        ),
        "pt": (
            "Bem-vindos ao Palácio de Quetzalpapálotl, uma das joias arquitetônicas mais refinadas de Teotihuacán "
            "e um dos complexos residenciais mais bem preservados do México pré-hispânico. "
            "Seu nome combina duas palavras náhuatl: quetzal, a ave de penas preciosas, "
            "e papálotl, que significa borboleta. O quetzal-borboleta era uma criatura mítica "
            "que simbolizava a transformação e a conexão entre o mundo terreno e o divino.\n\n"
            "Este palácio foi a residência dos sacerdotes de mais alto escalão na hierarquia teotihuacana. "
            "Foi construído por volta do ano 450 da nossa era, durante a última grande época de esplendor da cidade. "
            "O que torna este lugar único são seus extraordinários pilares esculpidos.\n\n"
            "Observem com atenção as colunas do pátio central. Cada uma está decorada com baixos-relevos "
            "que representam o quetzal-borboleta visto de frente, com as asas estendidas. "
            "Os olhos dessas criaturas são feitos com incrustações de obsidiana que originalmente brilhavam "
            "refletindo a luz do sol que entrava no pátio. As bordas das asas e os corpos "
            "conservam vestígios de pintura em vermelho, verde e amarelo, "
            "dando-nos uma ideia da explosão cromática que este espaço deveria ser.\n\n"
            "O sistema construtivo do palácio é notável. Os tetos eram feitos de grossas lajes de pedra "
            "sustentadas pelas colunas esculpidas, criando um espaço interior fresco e sombreado, "
            "ideal para o clima quente do vale. O piso era de estuque polido, "
            "tão liso que quase parecia mármore, e as paredes estavam cobertas de murais.\n\n"
            "Abaixo deste palácio encontra-se uma estrutura mais antiga conhecida como o Templo dos Caracóis Emplumados, "
            "que data de uma época anterior. Alguns de seus elementos decorativos, "
            "incluindo representações de caracóis marinhos adornados com penas, "
            "são visíveis na parte baixa do complexo e revelam as múltiplas camadas de história "
            "que se acumulam em cada canto de Teotihuacán."
        ),
    },
    "murales-puma": {
        "es": (
            "Estamos ante los Murales del Puma, uno de los conjuntos pictóricos más fascinantes de Teotihuacán "
            "y una ventana directa al mundo simbólico y artístico de esta antigua civilización. "
            "Estas pinturas murales, que datan aproximadamente del año 350 de nuestra era, "
            "representan pumas en procesión y son un ejemplo excepcional de la tradición muralista teotihuacana.\n\n"
            "La pintura mural fue una de las formas de expresión artística más importantes en Teotihuacán. "
            "Se estima que prácticamente todos los edificios de la ciudad, desde los templos más grandes "
            "hasta las viviendas comunes, estaban decorados con murales. "
            "Esto convierte a Teotihuacán en una de las ciudades más coloridas del mundo antiguo, "
            "un dato que a veces olvidamos al ver las piedras grises de las ruinas actuales.\n\n"
            "Observen los pumas representados en estos murales. Caminan en procesión, "
            "uno detrás de otro, con las fauces abiertas de las que brotan volutas que representan "
            "sonido, aliento o quizás canto sagrado. Cada puma porta elaborados tocados y ornamentos "
            "que sugieren que no son simples animales, sino seres sobrenaturales o sacerdotes "
            "disfrazados con atavíos de puma.\n\n"
            "En la cosmovisión teotihuacana, el puma era considerado guardián del inframundo "
            "y símbolo de poder nocturno. A diferencia del jaguar, más asociado con la selva y el sur, "
            "el puma se vinculaba con las tierras altas y el mundo de los muertos. "
            "Estos murales podrían representar una procesión de guerreros-puma "
            "o un ritual relacionado con el tránsito de las almas al inframundo.\n\n"
            "La técnica pictórica es extraordinaria. Los artistas aplicaban los pigmentos sobre estuco fresco, "
            "en una técnica similar al fresco europeo. Los colores, obtenidos de minerales y plantas, "
            "incluyen un rojo intenso de hematita, verde de malaquita, amarillo de limonita "
            "y un azul que todavía intriga a los investigadores. "
            "El hecho de que estos colores hayan sobrevivido más de mil seiscientos años "
            "es testimonio de la maestría técnica de los artistas teotihuacanos."
        ),
        "en": (
            "We are standing before the Puma Murals, one of the most fascinating pictorial ensembles in Teotihuacán "
            "and a direct window into the symbolic and artistic world of this ancient civilization. "
            "These mural paintings, dating to approximately 350 CE, "
            "depict pumas in procession and are an exceptional example of the Teotihuacán muralist tradition.\n\n"
            "Mural painting was one of the most important forms of artistic expression in Teotihuacán. "
            "It is estimated that virtually every building in the city, from the largest temples "
            "to common dwellings, was decorated with murals. "
            "This makes Teotihuacán one of the most colorful cities of the ancient world, "
            "a fact we sometimes forget when looking at the gray stones of today's ruins.\n\n"
            "Observe the pumas depicted in these murals. They walk in procession, "
            "one behind the other, with open jaws from which scrolls emerge representing "
            "sound, breath, or perhaps sacred song. Each puma wears elaborate headdresses and ornaments "
            "suggesting they are not mere animals but supernatural beings or priests "
            "disguised in puma regalia.\n\n"
            "In Teotihuacán cosmology, the puma was considered a guardian of the underworld "
            "and a symbol of nocturnal power. Unlike the jaguar, more associated with the jungle and the south, "
            "the puma was linked with the highlands and the world of the dead. "
            "These murals may represent a procession of puma-warriors "
            "or a ritual related to the passage of souls to the underworld.\n\n"
            "The pictorial technique is extraordinary. The artists applied pigments onto fresh stucco "
            "in a technique similar to European fresco. The colors, obtained from minerals and plants, "
            "include an intense hematite red, malachite green, limonite yellow, "
            "and a blue that still intrigues researchers. "
            "The fact that these colors have survived over sixteen hundred years "
            "is a testament to the technical mastery of Teotihuacán's artists."
        ),
        "pt": (
            "Estamos diante dos Murais do Puma, um dos conjuntos pictóricos mais fascinantes de Teotihuacán "
            "e uma janela direta para o mundo simbólico e artístico desta antiga civilização. "
            "Estas pinturas murais, que datam aproximadamente do ano 350 da nossa era, "
            "representam pumas em procissão e são um exemplo excepcional da tradição muralista teotihuacana.\n\n"
            "A pintura mural foi uma das formas de expressão artística mais importantes em Teotihuacán. "
            "Estima-se que praticamente todos os edifícios da cidade, desde os maiores templos "
            "até as moradias comuns, estavam decorados com murais. "
            "Isso torna Teotihuacán uma das cidades mais coloridas do mundo antigo, "
            "um fato que às vezes esquecemos ao ver as pedras cinzas das ruínas atuais.\n\n"
            "Observem os pumas representados nestes murais. Caminham em procissão, "
            "um atrás do outro, com as mandíbulas abertas das quais brotam volutas que representam "
            "som, alento ou talvez canto sagrado. Cada puma porta elaborados adornos de cabeça e ornamentos "
            "que sugerem que não são simples animais, mas seres sobrenaturais ou sacerdotes "
            "disfarçados com vestimentas de puma.\n\n"
            "Na cosmovisão teotihuacana, o puma era considerado guardião do submundo "
            "e símbolo do poder noturno. Diferente do jaguar, mais associado com a selva e o sul, "
            "o puma se vinculava com as terras altas e o mundo dos mortos. "
            "Estes murais poderiam representar uma procissão de guerreiros-puma "
            "ou um ritual relacionado com a passagem das almas ao submundo.\n\n"
            "A técnica pictórica é extraordinária. Os artistas aplicavam os pigmentos sobre estuque fresco, "
            "em uma técnica similar ao afresco europeu. As cores, obtidas de minerais e plantas, "
            "incluem um vermelho intenso de hematita, verde de malaquita, amarelo de limonita "
            "e um azul que ainda intriga os pesquisadores. "
            "O fato de estas cores terem sobrevivido mais de mil e seiscentos anos "
            "é testemunho da maestria técnica dos artistas teotihuacanos."
        ),
    },
    "museo-sitio": {
        "es": (
            "Nos encontramos frente al Museo de Sitio de Teotihuacán, el complemento perfecto para su visita "
            "a la zona arqueológica. Este museo, ubicado estratégicamente junto a la Pirámide del Sol, "
            "alberga una de las colecciones más completas de artefactos teotihuacanos "
            "y ofrece el contexto necesario para comprender la grandeza de lo que han visto durante su recorrido.\n\n"
            "El museo fue inaugurado en 1963 y renovado en múltiples ocasiones para incorporar los hallazgos "
            "de las excavaciones más recientes. Su diseño arquitectónico se integra respetuosamente con el paisaje, "
            "con gran parte de la estructura construida de manera semisubterránea "
            "para no competir visualmente con los monumentos arqueológicos.\n\n"
            "En su interior encontrarán varias salas temáticas. La primera les presenta una maqueta a escala "
            "de Teotihuacán en su apogeo, que les permitirá visualizar la extensión real de la ciudad, "
            "mucho más allá de lo que es visible en la zona excavada. "
            "Podrán apreciar cómo los barrios residenciales se extendían en todas direcciones "
            "albergando a más de 100,000 habitantes en complejos multifamiliares organizados.\n\n"
            "Las salas de cerámica exhiben la evolución artística de Teotihuacán a lo largo de sus 700 años de historia. "
            "Desde las vasijas utilitarias más sencillas hasta los elaborados incensarios ceremoniales "
            "con decoraciones de mariposas y deidades, la cerámica teotihuacana refleja "
            "una sociedad sofisticada con un sentido estético extraordinario.\n\n"
            "No se pierdan la colección de obsidiana, que incluye herramientas, armas y objetos rituales. "
            "Teotihuacán controlaba los principales yacimientos de obsidiana de la región, "
            "y este mineral volcánico fue la base de su poder económico. "
            "También encontrarán máscaras de piedra verde, figurillas, pinturas murales restauradas "
            "y los famosos objetos encontrados en las ofrendas del Templo de la Serpiente Emplumada.\n\n"
            "Les recomiendo dedicar al menos una hora a este museo. "
            "Es la manera ideal de cerrar su visita, poniendo en perspectiva todo lo que han experimentado "
            "y llevándose una comprensión más profunda de esta civilización extraordinaria."
        ),
        "en": (
            "We are standing before the Teotihuacán Site Museum, the perfect complement to your visit "
            "to the archaeological zone. This museum, strategically located next to the Pyramid of the Sun, "
            "houses one of the most complete collections of Teotihuacán artifacts "
            "and provides the context needed to understand the grandeur of what you have seen during your tour.\n\n"
            "The museum was inaugurated in 1963 and has been renovated multiple times to incorporate findings "
            "from the most recent excavations. Its architectural design integrates respectfully with the landscape, "
            "with much of the structure built in a semi-subterranean manner "
            "so as not to compete visually with the archaeological monuments.\n\n"
            "Inside you will find several thematic galleries. The first presents a scale model "
            "of Teotihuacán at its peak, allowing you to visualize the true extent of the city, "
            "far beyond what is visible in the excavated zone. "
            "You will appreciate how residential neighborhoods extended in all directions, "
            "housing over 100,000 inhabitants in organized multi-family complexes.\n\n"
            "The ceramics galleries exhibit the artistic evolution of Teotihuacán over its 700-year history. "
            "From the simplest utilitarian vessels to elaborate ceremonial incense burners "
            "decorated with butterflies and deities, Teotihuacán ceramics reflect "
            "a sophisticated society with an extraordinary aesthetic sense.\n\n"
            "Do not miss the obsidian collection, which includes tools, weapons, and ritual objects. "
            "Teotihuacán controlled the major obsidian deposits in the region, "
            "and this volcanic mineral was the foundation of its economic power. "
            "You will also find green stone masks, figurines, restored mural paintings, "
            "and the famous objects found in the offerings of the Temple of the Feathered Serpent.\n\n"
            "I recommend dedicating at least one hour to this museum. "
            "It is the ideal way to close your visit, putting into perspective everything you have experienced "
            "and taking with you a deeper understanding of this extraordinary civilization."
        ),
        "pt": (
            "Estamos diante do Museu de Sítio de Teotihuacán, o complemento perfeito para sua visita "
            "à zona arqueológica. Este museu, localizado estrategicamente junto à Pirâmide do Sol, "
            "abriga uma das coleções mais completas de artefatos teotihuacanos "
            "e oferece o contexto necessário para compreender a grandeza do que viram durante seu percurso.\n\n"
            "O museu foi inaugurado em 1963 e renovado em múltiplas ocasiões para incorporar os achados "
            "das escavações mais recentes. Seu design arquitetônico se integra respeitosamente com a paisagem, "
            "com grande parte da estrutura construída de maneira semisubterrânea "
            "para não competir visualmente com os monumentos arqueológicos.\n\n"
            "Em seu interior encontrarão várias salas temáticas. A primeira apresenta uma maquete em escala "
            "de Teotihuacán em seu apogeu, que lhes permitirá visualizar a extensão real da cidade, "
            "muito além do que é visível na zona escavada. "
            "Poderão apreciar como os bairros residenciais se estendiam em todas as direções, "
            "abrigando mais de 100.000 habitantes em complexos multifamiliares organizados.\n\n"
            "As salas de cerâmica exibem a evolução artística de Teotihuacán ao longo de seus 700 anos de história. "
            "Desde as vasilhas utilitárias mais simples até os elaborados incensários cerimoniais "
            "com decorações de borboletas e divindades, a cerâmica teotihuacana reflete "
            "uma sociedade sofisticada com um senso estético extraordinário.\n\n"
            "Não percam a coleção de obsidiana, que inclui ferramentas, armas e objetos rituais. "
            "Teotihuacán controlava os principais depósitos de obsidiana da região, "
            "e este mineral vulcânico foi a base de seu poder econômico. "
            "Também encontrarão máscaras de pedra verde, figurinhas, pinturas murais restauradas "
            "e os famosos objetos encontrados nas oferendas do Templo da Serpente Emplumada.\n\n"
            "Recomendo dedicar pelo menos uma hora a este museu. "
            "É a maneira ideal de encerrar sua visita, colocando em perspectiva tudo o que experimentaram "
            "e levando consigo uma compreensão mais profunda desta civilização extraordinária."
        ),
    },
}


async def generate_audio(text: str, voice: str, output_path: str) -> bool:
    try:
        communicate = edge_tts.Communicate(text, voice, rate="-8%", pitch="+0Hz")
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return False


async def main():
    # 1. Load and update pois.json
    with open(POIS_PATH, "r", encoding="utf-8") as f:
        pois = json.load(f)

    for poi in pois:
        slug = poi["slug"]
        if slug in SCRIPTS:
            poi["audioScript"] = SCRIPTS[slug]

    with open(POIS_PATH, "w", encoding="utf-8") as f:
        json.dump(pois, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Updated pois.json with audioScript for {len(SCRIPTS)} POIs")

    # 2. Generate audio files
    results = []
    errors = []
    langs = ["es", "en", "pt"]

    for poi in pois:
        slug = poi["slug"]
        scripts = poi.get("audioScript", {})

        for lang in langs:
            text = scripts.get(lang)
            if not text:
                errors.append(f"{slug}/{lang}: no audioScript")
                continue

            voice = VOICES[lang]
            out_dir = AUDIO_DIR / lang
            out_dir.mkdir(parents=True, exist_ok=True)
            out_path = out_dir / f"{slug}.mp3"

            print(f"Generating: {lang}/{slug}.mp3 ...", end=" ", flush=True)
            ok = await generate_audio(text, voice, str(out_path))

            if ok:
                size_kb = out_path.stat().st_size / 1024
                print(f"OK ({size_kb:.0f} KB)")
                results.append(f"public/audio/{lang}/{slug}.mp3")
            else:
                print("FAILED")
                errors.append(f"{slug}/{lang}: generation failed")

    report = {
        "texts_written": len(SCRIPTS),
        "langs": len(langs),
        "audio_files": len(results),
        "errors": errors,
        "status": "complete" if len(results) == 30 and not errors else "partial",
    }

    print("\n" + json.dumps(report, indent=2, ensure_ascii=False))
    return report


if __name__ == "__main__":
    report = asyncio.run(main())
    sys.exit(0 if report["status"] == "complete" else 1)
