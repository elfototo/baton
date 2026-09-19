import { Icon1 } from "./icons";
import { items } from "./consts";
import type { Item } from "./types";

function Card(props: Item) {
  return (
    <div className={`relative h-[528.47998046875px] shrink-0 rounded-[12px] overflow-hidden ${props.styles}`}>
      <div className={`z-[1] absolute left-[50%] shrink-0 translate-x-[-50%] overflow-hidden ${props.styles2}`} style={{...props.style}}></div>
      <div className={`z-[2] absolute left-[50%] flex flex-col items-start shrink-0 bg-white translate-x-[-50%] ${props.styles3}`}>
        <h1 className={`relative shrink-0 text-secondary-text font-sans text-2xl font-bold leading-8 text-left ${props.styles4} whitespace-pre-line`}>{props.title}</h1>
        <p className="relative shrink-0 text-secondary-text font-sans text-base font-normal leading-6 text-left whitespace-pre-line">{props.content}</p>
      </div>
    </div>
  );
}

export default function Services(): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-[88px] pt-[127px] pr-[376px] pb-[257px] pl-[376px] w-[1920px] h-[1593px] shrink-0 bg-secondary-background">
      <div className="flex flex-row items-center gap-[19px] pr-[2px] pb-[1px] w-[267.0783386230469px] h-12 shrink-0">
        <Icon1 />
        <h1 className="relative shrink-0 text-white whitespace-nowrap font-sans text-5xl font-bold leading-[48px] text-left">Services</h1>
      </div>
      <div className="grid grid-cols-[repeat(3,_379px)] grid-rows-[repeat(2,_528px)] gap-x-4 gap-y-4 w-[1167.9901123046875px] h-[1072.9599609375px] shrink-0">
        {items.map((item) => (
          <Card key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
