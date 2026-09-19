import { Icon1, Icon3, Icon4, Icon5 } from "./icons";
import type { Item } from "./types";

export const items: Item[] = [
  { id: 1, styles: "pt-[90px] pb-[37px]", styles2: "pt-6 pr-[71px] pb-6 pl-[71px] bg-accent-background-3", icon: (<Icon1 />), styles3: "gap-6 pt-[6px] h-[271px]", styles4: "", title: "Frontend\nStack", styles5: "h-48", list: [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "HTML5",
    "CSS3",
    "Tailwind CSS",
  ] },
  { id: 2, styles: "justify-center", styles2: "pt-[34px] pr-[81px] pb-[34px] pl-[81px] bg-accent-background-1", icon: (<Icon3 />), styles3: "gap-6 pt-[5px] h-[215px]", styles4: "", title: "Tools &\nPractices", styles5: "h-[136px]", list: [
    "Git",
    "Docker",
    "SWR",
    "Redux",
    "Context API",
  ] },
  { id: 3, styles: "pt-[89px] pb-[105px]", styles2: "pt-8 pr-[79px] pb-8 pl-[79px] bg-accent-background-4", icon: (<Icon4 />), styles3: "gap-[13px] pt-[3px] h-[204px]", styles4: "whitespace-nowrap", title: "Approach", styles5: "h-[156px]", list: [
    "Responsive Design",
    "Web Performance\nOptimization",
    "Telegram Web\nApps",
    "API Integration",
  ] },
  { id: 4, styles: "pt-[90px] pb-[149px]", styles2: "pt-[34px] pr-[81px] pb-[34px] pl-[81px] bg-secondary-background", icon: (<Icon5 />), styles3: "gap-[19px] pt-[5px] h-[159px]", styles4: "", title: "UI / UX &\nDesign", styles5: "h-20", list: [
    "Figma",
    "Adobe Photoshop",
    "Adobe Illustrator",
  ] },
];