let functions = require('./functions.js');

const start = async () => {
  let population = await functions.initializePop();
  //console.log("🚀 ~ file: start.js ~ line 5 ~ start ~ population", population)
  let population1 = await functions.rolet(population);
  let population2 = [];
  for(let i = 0; i < functions.num_ger; i++){

    population2 = await functions.crossover(population1);
    population2 = await functions.mutation(population2);

    population2 = await functions.calcAptiPop(population2, i + 1)
    population2 = await functions.rolet(population2);

    
    population2 = await functions.elitism(population1 ,population2);
    await functions.printBestChromossome(population2, i+1);

    population1 = population2;
    population2 = [];
  }

}

start();