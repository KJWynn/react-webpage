import { useState, useEffect } from 'react'
import './App.css'
import * as XLSX from "xlsx";


interface Card {
  image: string;
  setName: string;
  collectorNum: string;
  name: string;
  description: string;
}

type CardProps = {
  card: Card;
}

type SortProps = {
  handleSort: () => void
}

type ExcelCardData = {
  Image: string;
  Set: number;
  'Collector Number': number;
  Name: string;
  Description: string;

}

// reads the card data from the excel file and returns an array of card objects
async function readExcelCardData(filePath: string): Promise<Card[]>{
  const response = await fetch(filePath);
  const data = await response.arrayBuffer();
  const workbook = XLSX.read(data, {type: "array"});
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json<ExcelCardData>(sheet);
  return jsonData.map((row)=>({
      image: row["Image"],
      setName: String(row["Set"]).toUpperCase(),
      collectorNum: String(row["Collector Number"]).padStart(3, "0"),
      name: row["Name"],
      description: row["Description"],
  }));
}

function sortByCollectorNum (cards: Card[], ascending=true) {
  return ascending? cards.sort((a,b)=> Number(a.collectorNum)-Number(b.collectorNum)): 
  cards.sort((a,b)=> Number(b.collectorNum)-Number(a.collectorNum));
}


function App() {
  return (
    <>
      <Header></Header>
      <CardListing></CardListing>
    </>
  )
}


function Header() {
  return    ( 
  <header>
    <h1>Card Listing Page</h1>
    <img className="banner" src="/banner.jpeg" alt="Earlybird promotion banner" />
  </header>
  )
}

function CardListing() {

  const [cards, setCards] = useState<Card[]>([]); // Card objects to be populated from fetch of API
  const [sortOrder, setSortOrder] = useState(true); // ascending sort order by default


  useEffect(() => {
    async function fetchData() {
      try {
          const cardData =  await readExcelCardData("cards.xlsx");
          setTimeout(()=>setCards(sortByCollectorNum(cardData, sortOrder)), 3000) // simulate delay
      } catch (error) {
        console.error("Error loading card data:", error);
      }
    }
    fetchData();
  }, []); // Fetch once when mount

  return (
    <section className="card-listing">
      <SortToggle handleSort={()=>setSortOrder(!sortOrder)}></SortToggle> // toggle sort order
      <hr />
        <div className = "card-grid">

        {cards.length > 0 ? (
          sortByCollectorNum(cards, sortOrder).map((card) => <CardArticle key={card.collectorNum} card={card} />) // sort the cards first based on sort order
        ) : (
          <p>Loading cards...</p> // if not fetched then display loading cards instead
        )}
        </div>
    </section>
  )
}

/**
 * 
 * @param param0 the Card instance
 * @returns Article element containing the card image and information
 */
function CardArticle({card}:CardProps) {
  return (
  <article className='card'>
      <img src={card.image} alt = {`Image of ${card.name} card.`} />
      <p style={{fontSize: 16, paddingLeft:4}}>{card.setName} | {card.collectorNum}</p>
      <p style={{fontSize: 20, fontWeight:'bold'}}>{card.name}</p>
      <p style={{fontSize: 16}}>{card.description}</p>
  </article>)
}

/**
 * 
 * @param param0 Sort function to set the sort order
 * @returns The sort feature: select element with ascending and descending options
 */
function SortToggle({handleSort}: SortProps) {
  return (
  <div className="sort-feature">
  <label htmlFor="sort-select">Sort By:</label>
  <select name="sort" id="sort-select" onChange={handleSort} >
    <option value="ascending">
      Collector Number - Ascending
    </option>
    <option value="descending">Collector Number - Descending</option>
  </select>
</div>
  )
}

export default App
