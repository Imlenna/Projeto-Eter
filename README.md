# Projeto Éter

Mapa celeste interativo (p5.js + Astronomy Engine). 

##História
Presente de aniversário atrasado da Broma/Luisa parabéns de novo.

Na mitologia grega, Éter (em grego: Aithêr, é significa algo como "Faz brilhar") é um dos deuses primordiais, personificando o céu superior, o ar puro, brilhante e luminoso que fica acima das nuvens. Na filosifia o conceito de Éter é primariamente como o quinto elemento ou quinta essência (quinta essentia), uma substância divina, imutável e perfeita que preenche os céus, diferenciando-se dos quatro elementos terrestres (terra, água, ar e fogo). A quinta essência para Aristóteles era uma substância pura e imutável que compunha os corpos celestes.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera a pasta dist/ para publicar
```

## Estrutura

- `index.html`: página
- `src/main.js`: lógica do mapa e da interação
- `src/data.js`: nomes, descrições e estrelas próximas (edite aqui para ampliar os textos)
- `src/style.css`: estilos
- `public/data/`: estrelas que formam as constelações (Hipparcos, filtradas) e as linhas das 88 constelações (projeto d3-celestial, licença BSD)
