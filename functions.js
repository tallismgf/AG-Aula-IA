const pop_size = 100;
const num_ger = 40;
const sizeChromosome = 44;
const TaxaMutacao = 0.008;
const TaxaCrossover = 0.65;
const MultCalcApti = 200 / (Math.pow(2, 22) - 1);


const F6 = (x, y) => {
  const square = x**2 + y**2;
  let result = 0.5 - ( ( Math.sin( Math.sqrt(square) ) **2-0.5) / ( 1 + (0.001*square) ) **2 )  

  return result;
}

const initializePop = () => {
  return new Promise(async resolve => {
    let finalPop = [];

    for(let i = 0; i < pop_size; i++) {
      let aux = [];

      for(let j = 0; j < 44; j++) {
        aux.push( Math.round( Math.random() ).toString() );
      }

      let aptIndividuo = await calcApti(aux);

      finalPop.push({
        chr: aux,
        apt: aptIndividuo
      });
    }

    resolve(finalPop);
  });
}

const calcApti = ( chromosome ) => {
  return new Promise(resolve => {
    let x = chromosome.slice(0, (sizeChromosome / 2));
    let y = chromosome.slice(sizeChromosome / 2)

    let xStr = x.join('');
    let yStr = y.join('');

    //let xStr = '0000101000011000000001';
    //let yStr = '1000101010001110111011';

    let xInt = (parseInt(xStr, 2) * MultCalcApti) - 100;
    let yInt = (parseInt(yStr, 2) * MultCalcApti) - 100;

    let Apt = F6(xInt, yInt);

    resolve(Apt);
  });
}

const rolet = (population) => {
  return new Promise(async resolve => {
    let aptTotal = 0;
    let aptPassed = [];
    
    population.forEach(pop => aptTotal+=pop.apt);
    
    for( let i=0; i < population.length; i++ ) {
      let sumRol =  0;
      let rand = Math.random() * aptTotal;
      
      for(let j = 0; j < population.length; j++){
        sumRol += population[j].apt;
        if( sumRol >= rand ) {
          aptPassed.push(population[j]);
          break;
        }
      }
      
    }

    resolve(aptPassed);
  });
}

const crossover = (population) => {
  return new Promise((resolve) => {
    let newPopulation = [];
    for(let i = 0; i < population.length; i+=2){
      let pontoCorte = Math.random();
  
      if(pontoCorte <= TaxaCrossover){
        let intPontoCorte = Math.round(pontoCorte * population[i].chr.length);
        let child1 = population[i].chr.slice(0, intPontoCorte);
        child1 = child1.concat(population[i+1].chr.slice(intPontoCorte, population[i].chr.length));
        let child2 = population[i+1].chr.slice(0, intPontoCorte);
        child2 = child2.concat(population[i].chr.slice(intPontoCorte, population[i].chr.length));
        newPopulation.push(child1);
        newPopulation.push(child2);
      } else {
        newPopulation.push(population[i].chr);
        newPopulation.push(population[i+1].chr);
      }
    }

    resolve(newPopulation);
  }); 
}

const mutation = (population) => {
  return new Promise((resolve) => {
    let newPopulation = [];

    for(let i = 0; i < population.length; i++){
      let newCromossome = [];
      let cromossome = population[i];
      for(let j = 0; j < cromossome.length; j++){
        let randNum = Math.random();
        if(randNum <= TaxaMutacao){
          let newData = cromossome[j] === '1' ? '0' : '1';
          newCromossome.push(newData);
        } else {
          newCromossome.push(cromossome[j]);
        }
      }

      newPopulation.push(newCromossome);
    }

    resolve(newPopulation);
  })
}

const calcAptiPop = (population, numGeracao) => {
  return new Promise(async (resolve) => {
    let PopWithApti = [];

    for(let i = 0; i < population.length; i++){
      let cromossome = population[i];

      let apiCromossome = await calcApti(cromossome);

      PopWithApti.push({
        chr: cromossome,
        apt: apiCromossome
      })

      //console.log(`Geração: ${numGeracao} Cromossomo: ${cromossome.join('')}  Aptidão: ${apiCromossome.toFixed(6)}`);
    }    

    resolve(PopWithApti);
  })
}

const printBestChromossome = (population, numGeracao, print=true) => {
  return new Promise(resolve => {

    let bestChr = {chr: '', apt: 0};
    let mediaApt = 0;
    population.forEach(chromosome => {
      mediaApt = mediaApt + chromosome.apt;
      if(chromosome.apt > bestChr.apt){
        bestChr = chromosome;
      }
    })

    if(print){
      console.log(`Geração: ${numGeracao} Cromossomo: ${bestChr.chr.join('')}  Aptidão: ${bestChr.apt.toFixed(6)}`);
      console.log(`Media da aptidão ${(mediaApt / population.length).toFixed(6)}`);
    }

    if(print && numGeracao === num_ger){
      let x = (bestChr.chr.slice(0, (sizeChromosome / 2)).join(''));
      let y = (bestChr.chr.slice(sizeChromosome / 2)).join('');

      let valueX = parseInt(x, 2);
      let valueY = parseInt(y, 2);
      
      console.log(`Cromossomo X: ${x} Valor de X: ${valueX} \nCromossomo X: ${y} Valor de X: ${valueY}`);

    }
    
    resolve(bestChr);
  });
}

const elitism = (populationOld, populationNew) => {
  return new Promise(async resolve => {

    let bestPopulationOld = await printBestChromossome(populationOld, 0, false);

    let indexNewSmallest = 0;
    let smallestApt = 0;

    for(let i = 0; i < populationNew.length; i++){
      if(i === 0){
        indexNewSmallest = i;
        smallestApt = populationNew[i].apt;
        continue;
      }

      if(populationNew[i].apt < smallestApt){
        indexNewSmallest = i;
        smallestApt = populationNew[i].apt;
        continue;
      }
    }

    let worstChr = populationNew[indexNewSmallest];

    if(worstChr.apt > bestPopulationOld.apt){
      resolve(populationNew);
    } else {
      //console.log(`Melhor individuo da geração anterior - ${bestPopulationOld.chr.join('')} - ${bestPopulationOld.apt}`);
      //console.log(`Pior individuo da geração atual - ${worstChr.chr.join('')} - ${worstChr.apt}`);
  
      let newPopulation = populationNew;
      newPopulation.splice(indexNewSmallest, 1, bestPopulationOld);
    
      resolve(newPopulation);
    }
  })
}

module.exports = {
  pop_size,
  num_ger,
  F6,
  initializePop,
  calcApti,
  rolet,
  crossover,
  mutation,
  calcAptiPop,
  printBestChromossome,
  elitism
}