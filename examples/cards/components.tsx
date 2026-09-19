import { Icon2 } from "./icons";
import { items } from "./consts";
import type { Item } from "./types";

function Card(props: Item) {
  return (
    <div className={`relative flex flex-col items-start pr-[89px] pl-[33px] w-[280px] h-[398px] shrink-0 bg-white rounded-[12px] ${props.styles}`}>
      <div className={`z-[1] absolute left-[50%] top-[-59px] flex flex-col items-center w-[222.38999938964844px] h-32 shrink-0 rounded-[12px] translate-x-[-50%] ${props.styles2}`}>
        {props.icon}
      </div>
      <div className={`flex flex-col items-start w-[158.38999938964844px] shrink-0 ${props.styles3}`}>
        <h1 className={`relative shrink-0 text-secondary-text font-sans text-2xl font-bold leading-8 text-left ${props.styles4} whitespace-pre-line`}>{props.title}</h1>
        <ul className={`flex flex-col justify-between items-center w-[158.38999938964844px] shrink-0 ${props.styles5}`}>
          {props.list.map((row, rowIndex) => (
            <li key={rowIndex} className="flex flex-row items-center gap-[9px] w-[158.38999938964844px] h-6 shrink-0">
              <Icon2 />
              <span className="relative shrink-0 text-secondary-text font-sans text-base font-normal leading-5 text-left whitespace-pre-line" >{row}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Skills(): JSX.Element {
  return (
    <div className="flex flex-col justify-between items-center pt-[349px] pr-[376px] pb-[349px] pl-[376px] w-[1920px] h-[1306px] shrink-0 bg-accent-background-2">
      <h1 className="relative shrink-0 text-tertiary-text whitespace-nowrap font-sans text-5xl font-bold leading-[48px] text-left">Skills</h1>
      <div className="flex flex-row justify-between items-center w-[1168px] h-[398px] shrink-0">
        {items.map((item) => (
          <Card key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
