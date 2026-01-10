'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';
import { useStore, Task, Note, Script } from '@/lib/store';
import { useModalPrompt } from '@/components/ModalPromptProvider';

// Icons
const Icons = {
  GitHub: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  Sync: ({ className }: { className?: string }) => (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Comment: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  History: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Folder: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Archive: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Command: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Pin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Play: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Stop: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  ImportExport: () => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="#fff" stroke="currentColor" viewBox="0 0 512 512">
      <path d="M0 0 C5.4660018 4.27168773 10.64362147 8.80254841 15.6875 13.5625 C16.42484375 14.23539063 17.1621875 14.90828125 17.921875 15.6015625 C22.45564598 19.89417545 26.388377 24.51393148 30.125 29.5 C30.59405762 30.12503418 31.06311523 30.75006836 31.54638672 31.39404297 C34.10266569 34.93859686 36.17793414 38.43905777 37.9765625 42.42578125 C41.33844964 50.68288437 41.33844964 50.68288437 47.60546875 56.546875 C52.10241189 57.84359058 56.69799455 58.02189077 61.34716797 58.31347656 C82.45562035 60.55952512 103.20988945 76.3172478 116.5703125 91.85546875 C125.66670019 103.48608991 133.37616282 116.7238584 136.0625 131.375 C136.82164736 135.15398451 136.82164736 135.15398451 139.37109375 137.7890625 C141.78990834 138.59681343 144.18499878 139.07118973 146.6875 139.5625 C173.42329278 147.64309409 193.68083336 164.48086262 207.6875 188.5625 C219.78245679 211.27516694 222.89803125 239.85355804 215.9375 264.66796875 C207.8084535 290.77224069 189.89110689 311.61700147 166.125 324.890625 C161.84267436 326.97339247 157.50514605 328.7892562 153.0625 330.5 C152.28696777 330.80703857 151.51143555 331.11407715 150.71240234 331.43041992 C143.66947337 334.00817057 136.49963938 335.01023691 129.4375 332 C124.0739897 328.91652444 120.66055937 324.84707417 118.25 319.1875 C117.06658479 311.56104643 118.21444298 305.84895851 122.6875 299.5625 C126.85564448 295.66579764 130.37633252 293.63805691 135.8125 291.6875 C151.51339433 285.72057972 164.08338341 276.96143203 171.6875 261.5625 C178.0580252 247.34660131 179.56158771 230.26840056 174 215.4375 C166.73016005 199.51308868 156.01472202 188.05221062 139.671875 181.3203125 C133.26532846 179.11504397 127.13825393 178.25025326 120.4375 177.6875 C113.436679 177.0684095 107.60967282 176.05261584 102.6875 170.5625 C99.08836486 165.29025339 98.11442941 161.35352257 97.75 155.0625 C96.31677577 138.57448489 90.47561083 124.25045058 78.2578125 112.6953125 C64.39981763 101.19612527 49.60946637 97.24566306 31.9375 97.75 C26.10988736 97.77758633 23.25717171 97.19958565 18.6875 93.5625 C13.95958026 88.86435503 11.229741 84.00743884 8.75 77.875 C-1.9952549 52.76192088 -18.81316554 34.03590416 -44.3125 23.5625 C-66.89313175 14.92721274 -93.24180038 15.76098511 -115.36572266 25.46289062 C-123.35000929 29.23693129 -130.62729681 33.77197084 -137.3125 39.5625 C-138.10914063 40.20445313 -138.90578125 40.84640625 -139.7265625 41.5078125 C-154.75433182 54.11625054 -164.64859352 72.6847833 -169.3125 91.5625 C-169.63154297 92.84060547 -169.63154297 92.84060547 -169.95703125 94.14453125 C-171.0581766 99.301694 -171.41540149 104.34431107 -171.59765625 109.59863281 C-172.2570167 128.13956193 -172.2570167 128.13956193 -179.0625 134.5 C-183.61726089 137.39052133 -188.15814621 138.94132329 -193.29296875 140.421875 C-214.06293061 146.4766787 -230.81479571 158.03435737 -241.51147461 177.11694336 C-252.04461194 196.70631473 -255.06098143 219.37224177 -248.69921875 240.890625 C-240.71028532 262.04442056 -225.8044006 278.22797808 -205.23925781 287.71484375 C-194.05938532 292.63330768 -183.21536552 294.37335476 -171.09228516 295.31176758 C-163.60209697 295.99479042 -157.73903953 297.56859072 -152.70092773 303.44091797 C-149.10213041 308.35107967 -147.85693774 313.52174445 -148.3125 319.5625 C-149.92109444 326.38413199 -152.49879471 330.68669647 -158.3125 334.5625 C-169.93706206 341.34349454 -190.68135936 336.42040069 -203.04589844 333.1953125 C-234.03641011 324.54307141 -262.17802188 304.6787031 -278.43359375 276.62792969 C-288.79697561 257.938806 -293.95001437 238.17737944 -293.75 216.8125 C-293.74695862 216.11761475 -293.74391724 215.42272949 -293.74078369 214.70678711 C-293.66719849 203.2902886 -292.73563665 192.5034218 -289.3125 181.5625 C-289.10351074 180.87881348 -288.89452148 180.19512695 -288.67919922 179.49072266 C-279.73245759 151.14932166 -259.34654512 125.31580993 -233.04296875 111.19921875 C-230.37261964 109.82675732 -227.68294128 108.50223748 -224.96875 107.21875 C-224.36466309 106.92774414 -223.76057617 106.63673828 -223.13818359 106.33691406 C-221.3125 105.5625 -221.3125 105.5625 -217.5078125 104.578125 C-213.74055455 102.2017129 -213.66957411 101.5061477 -212.7109375 97.328125 C-212.34281711 95.160659 -212.00317274 92.98822338 -211.6875 90.8125 C-211.28906847 88.51969141 -210.88414408 86.22800141 -210.47265625 83.9375 C-210.27816895 82.83148438 -210.08368164 81.72546875 -209.88330078 80.5859375 C-205.38360983 56.75181741 -191.89758546 34.84326858 -175.3125 17.5625 C-174.48234375 16.66917969 -173.6521875 15.77585938 -172.796875 14.85546875 C-128.94487476 -30.98397595 -51.11388364 -37.39247213 0 0 Z " transform="translate(293.3125,23.4375)" />
      <path d="M0 0 C5.0533662 3.12070462 7.93997249 6.44532529 10.234375 11.89453125 C11.61423915 18.71114206 11.40863187 25.61066165 11.43969727 32.54077148 C11.44928847 33.9210997 11.45929927 35.30142505 11.46969604 36.68174744 C11.49661662 40.4126005 11.51769531 44.14346605 11.53769803 47.87436175 C11.5596373 51.77946898 11.58698697 55.68453829 11.61375427 59.58961487 C11.66357417 66.97713173 11.70855249 74.36466976 11.75177664 81.75222784 C11.80124076 90.16579805 11.85612473 98.57933019 11.91145623 106.99286354 C12.02511186 124.29338422 12.13198635 141.59394029 12.234375 158.89453125 C12.69328125 158.48460937 13.1521875 158.0746875 13.625 157.65234375 C14.23859375 157.11351562 14.8521875 156.5746875 15.484375 156.01953125 C16.08765625 155.48585938 16.6909375 154.9521875 17.3125 154.40234375 C22.49093101 150.33959097 27.22774436 150.35247926 33.67578125 150.453125 C40.58011188 151.30953484 44.40531066 154.75318763 48.796875 159.89453125 C51.40604899 165.35559309 51.37740581 172.08105196 50.234375 177.89453125 C46.41182841 185.0663223 40.86216684 190.70741587 35.14453125 196.3828125 C34.28178085 197.24843307 33.41903046 198.11405365 32.53013611 199.00590515 C30.71591303 200.82215826 28.89794185 202.63467446 27.07641602 204.44360352 C24.29805599 207.20585711 21.53611846 209.9838081 18.77539062 212.76367188 C17.00356557 214.53351508 15.23081042 216.30242776 13.45703125 218.0703125 C12.6370314 218.89638504 11.81703156 219.72245758 10.97218323 220.57356262 C4.7401249 226.73015586 -0.45468396 231.45704186 -9.640625 231.51953125 C-10.77242187 231.55304688 -11.90421875 231.5865625 -13.0703125 231.62109375 C-22.20815881 229.82443475 -28.92145366 222.18426917 -35.25390625 215.8046875 C-36.11952682 214.9419371 -36.9851474 214.07918671 -37.8769989 213.19029236 C-39.69325201 211.37606928 -41.50576821 209.5580981 -43.31469727 207.73657227 C-46.07695086 204.95821224 -48.85490185 202.19627471 -51.63476562 199.43554688 C-53.40460883 197.66372182 -55.17352151 195.89096667 -56.94140625 194.1171875 C-57.76747879 193.29718765 -58.59355133 192.47718781 -59.44465637 191.63233948 C-65.60124961 185.40028115 -70.32813561 180.20547229 -70.390625 171.01953125 C-70.17838344 164.13997715 -68.58962241 159.80486419 -63.765625 154.89453125 C-58.39644814 150.30835935 -53.1784568 150.18199579 -46.22265625 150.3671875 C-39.53418135 151.38746333 -35.37846787 155.24764526 -30.765625 159.89453125 C-30.76600203 159.14007501 -30.76637905 158.38561876 -30.7667675 157.60830021 C-30.77389257 139.22887025 -30.74791555 120.84975789 -30.6853466 102.47042942 C-30.65588191 93.58219339 -30.6375154 84.69419599 -30.64550781 75.8059082 C-30.65244771 68.05652042 -30.63832759 60.30750212 -30.59918892 52.55820507 C-30.57920356 48.45698683 -30.56958101 44.35634836 -30.58520126 40.25509834 C-30.59959019 36.38962148 -30.58568273 32.5252492 -30.55067253 28.65991402 C-30.54274627 27.24627648 -30.54489358 25.83253831 -30.55823326 24.4189415 C-30.63403503 15.63916718 -29.87272769 9.49362678 -23.765625 2.89453125 C-17.29271618 -2.6344117 -7.84970384 -3.13766411 0 0 Z " transform="translate(205.765625,281.10546875)" />
      <path d="M0 0 C0.94875 -0.0103125 1.8975 -0.020625 2.875 -0.03125 C11.9942271 1.51901861 17.58127063 7.50403426 23.828125 13.83203125 C24.73955261 14.74200363 25.65098022 15.65197601 26.59002686 16.58952332 C28.50914763 18.50726725 30.42117575 20.43172677 32.328125 22.36157227 C34.75933405 24.82118376 37.20581729 27.26489666 39.65761185 29.703969 C42.0138244 32.05151225 44.35802441 34.41088652 46.703125 36.76953125 C47.57608215 37.63955276 48.44903931 38.50957428 49.34844971 39.40596008 C55.61743913 45.7725465 60.56121229 50.99820678 60.625 60.375 C60.41275844 67.2545541 58.82399741 71.58966706 54 76.5 C48.63119944 81.08585048 43.41582392 81.20920019 36.4609375 81.03125 C30.29673854 80.08505242 26.30317239 76.80317239 22 72.5 C21.99668985 73.21322639 21.99337971 73.92645277 21.98996925 74.66129208 C21.90864489 92.03922877 21.81652169 109.41707489 21.71247292 126.7948904 C21.6624138 135.19877247 21.61597026 143.60264512 21.578125 152.0065918 C21.54511852 159.33397685 21.50523985 166.66128728 21.45720994 173.98858982 C21.43203076 177.86605648 21.41022446 181.74347418 21.39665604 185.62100029 C21.38375738 189.27603048 21.36162021 192.93089203 21.33261681 196.58582878 C21.31932652 198.55573132 21.31563468 200.52569143 21.31230164 202.49563599 C21.22144649 212.18344959 21.04002611 221.19502667 14 228.5 C8.56951235 233.00614932 3.41529443 233.22650908 -3.546875 233.01171875 C-10.17271675 232.02983496 -14.09199725 228.99745598 -18.08258057 223.77403259 C-21.2644554 218.04054434 -20.5711438 211.49125425 -20.54589844 205.11938477 C-20.55464147 203.66023155 -20.5651298 202.2010879 -20.57722473 200.74195862 C-20.60501636 196.79614125 -20.60849094 192.85063777 -20.60750484 188.90473676 C-20.61063986 184.77536365 -20.63627028 180.64613069 -20.65948486 176.51683044 C-20.70000344 168.70430301 -20.72037581 160.89185895 -20.73345876 153.07924265 C-20.74934286 144.18195606 -20.78776441 135.28481108 -20.82805204 126.38760674 C-20.91039427 108.09178263 -20.96452181 89.79597199 -21 71.5 C-21.53109375 71.98210937 -22.0621875 72.46421875 -22.609375 72.9609375 C-23.31578125 73.59257812 -24.0221875 74.22421875 -24.75 74.875 C-25.44609375 75.50148438 -26.1421875 76.12796875 -26.859375 76.7734375 C-32.12555183 81.02097429 -36.80150113 81.04504681 -43.44140625 80.94140625 C-50.34573688 80.08499641 -54.17093566 76.64134362 -58.5625 71.5 C-61.17167399 66.03893816 -61.14303081 59.31347929 -60 53.5 C-56.1799563 46.34122147 -50.64406349 40.69004021 -44.9453125 35.01171875 C-44.08493378 34.14609818 -43.22455505 33.2804776 -42.33810425 32.3886261 C-40.52816249 30.57229665 -38.71438552 28.7597816 -36.89697266 26.95092773 C-34.12782774 24.19031903 -31.3779041 21.41151414 -28.62890625 18.63085938 C-26.8605065 16.86084797 -25.09101177 15.09192974 -23.3203125 13.32421875 C-22.50547394 12.49814621 -21.69063538 11.67207367 -20.85110474 10.82096863 C-14.80275511 4.84528158 -8.95030577 -0.09728593 0 0 Z " transform="translate(316,279.5)" />
    </svg>

  )
};

// Login Screen
function LoginScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icons.GitHub />
        </div>
        <h1 className="text-3xl font-bold mb-2">DevHub</h1>
        <p className="text-gray-400 mb-8">Kanban, Notes & Scripts Manager</p>

        <button
          onClick={() => signIn('github')}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-3"
        >
          <Icons.GitHub />
          Sign in with GitHub
        </button>

        <p className="text-xs text-gray-500 mt-6">
          Secure OAuth authentication. Your data is stored in your own GitHub repository.
        </p>
      </div>
    </div>
  );
}

// Repository Selector
function RepoSelector() {
  const { user, availableRepos, loadAvailableRepos, setRepo, createNewRepo, isSyncing, syncStatus, isAuthenticated } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newRepoName, setNewRepoName] = useState('devhub-data');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // Only load repos when authenticated (token is set)
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const loadRepos = async () => {
      try {
        setError('');
        await loadAvailableRepos();
      } catch (err: any) {
        console.error('Failed to load repos:', err);
        setError(err.message || 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    };
    loadRepos();
  }, [loadAvailableRepos, isAuthenticated]);


  const filteredRepos = availableRepos.filter(repo =>
    repo.full_name.toLowerCase().includes(filter.toLowerCase())
  );
  const handleCreateRepo = async () => {
    try {
      setError('');
      await createNewRepo(newRepoName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create repository');
    }
  };
  const handleSelectRepo = async (repoName: string) => {
    try {
      setLoading(true);
      setError('');
      await setRepo(repoName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to select repository');
    } finally {
      setLoading(false);
    }
  };
  const handleRetry = () => {
    setLoading(true);
    setError('');
    loadAvailableRepos()
      .catch(err => {
        console.error('Retry failed:', err);
        setError(err.message || 'Failed to load repositories');
      })
      .finally(() => setLoading(false));
  };
  if (loading || isSyncing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icons.Sync className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-400">{syncStatus || 'Loading repositories...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            {user?.image && (
              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <h2 className="font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-400">@{user?.login}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="ml-auto p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
              title="Sign out"
            >
              <Icons.Logout />
            </button>
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a Repository</h3>
          <p className="text-sm text-gray-400">Choose a repository to store your DevHub data</p>
        </div>

        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Icons.Plus /> Create New Repository
          </button>

          {showCreate && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newRepoName}
                onChange={e => setNewRepoName(e.target.value)}
                placeholder="Repository name"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCreateRepo}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
              >
                Create
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="text-xs text-red-300 hover:text-red-200 underline"
              >
                Click here to retry
              </button>
            </div>
          )}

          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search repositories..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-indigo-500"
          />

          <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
            {availableRepos.length === 0 && !error ? (
              <div className="text-center text-gray-500 py-4">
                <p className="mb-2">No repositories found</p>
                <p className="text-xs">Create a new repository above to get started</p>
              </div>
            ) : filteredRepos.length === 0 && filter ? (
              <p className="text-center text-gray-500 py-4">No repositories match "{filter}"</p>
            ) : (
              filteredRepos.map(repo => (
                <button
                  key={repo.id}
                  onClick={() => handleSelectRepo(repo.full_name)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-left"
                >
                  <Icons.Folder />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{repo.name}</p>
                    <p className="text-xs text-gray-400 truncate">{repo.full_name}</p>
                  </div>
                  {repo.private && (
                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">Private</span>
                  )}
                </button>
              ))
            )}
          </div>

          {availableRepos.length > 0 && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Showing {filteredRepos.length} of {availableRepos.length} repositories
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header() {
  const { data: session } = useSession();
  const {
    currentTab, setCurrentTab, workspaces, currentWorkspace,
    switchWorkspace, syncNow, isSyncing, syncStatus, repo,
    hasUnsavedChanges, clearSession, saveToGitHub, setGlobalSearchOpen, data
  } = useStore();

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showImportExportModal, setShowImportExportModalModal] = useState(false);

  const handleSignOut = () => {
    clearSession();
    signOut();
  };
  const tabs = ['kanban', 'notes', 'scripts'] as const;

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-indigo-400">DevHub</h1>
            <div className="flex items-center gap-2">
              <select
                value={currentWorkspace}
                onChange={e => switchWorkspace(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
              >
                {workspaces.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <button
                onClick={() => setShowWorkspaceModal(true)}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition"
                title="Manage Workspaces"
              >
                <Icons.Plus />
              </button>
            </div>

            <div className="relative flex bg-gray-700/60 rounded-lg p-1 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`relative z-10 px-4 py-2 text-sm font-medium capitalize ${currentTab === tab ? 'text-white solute rounded-md bg-indigo-600' : 'text-gray-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-500 hidden sm:block">{repo + '/' + currentWorkspace + '.json'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs ${hasUnsavedChanges ? 'text-yellow-400' : 'text-gray-400'}`}>
              {syncStatus}
            </span>
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
              title="Global Search (Ctrl+K)"
            >
              <Icons.Search />
            </button>
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="p-2 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
              title="Sync with GitHub"
            >
              <Icons.Sync className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={saveToGitHub}
              disabled={isSyncing || !hasUnsavedChanges}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
              title="Manual Save to GitHub"
            >
              Save
            </button>
            <button
              onClick={() => setShowImportExportModalModal(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
              title="Import/Export Workspaces"
            >
              <Icons.ImportExport />
            </button>
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ''}
                className="w-8 h-8 rounded-full"
              />
            )}
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-red-400"
              title="Sign out"
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </header>

      {showWorkspaceModal && (
        <WorkspaceModal onClose={() => setShowWorkspaceModal(false)} />
      )}
      {showImportExportModal && (
        <ImportExportModal onClose={() => setShowImportExportModalModal(false)} />
      )}
    </>
  );
}

// Workspace Modal
function WorkspaceModal({ onClose }: { onClose: () => void }) {
  const { workspaces, createWorkspace, deleteWorkspace, exportWorkspace, importWorkspace, showConfirm } = useStore();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createWorkspace(newName.trim());
      setNewName('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (name: string) => {
    const message = `Delete workspace "${name}"?`
    showConfirm(
      "Delete Workspace",
      message,
      () => deleteWorkspace(name)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Manage Workspaces</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition">
            <Icons.Close />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="New workspace name"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
            >
              Create
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {workspaces.map(w => (
              <div key={w} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span>{w}</span>
                {w !== 'default' && (
                  <button
                    onClick={() => handleDelete(w)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Icons.Trash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// Global Search Modal
interface SearchResult {
  type: 'task' | 'note' | 'script';
  id: string;
  title: string;
  content: string;
  label?: string;
  location: string;
  item: Task | Note | Script;
  columnId?: string;
}
function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const { data, setCurrentTab, selectNote, selectScript, currentWorkspace } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];
    // Search tasks
    data.kanban.columns.forEach(column => {
      column.tasks.forEach(task => {
        const matchTitle = task.title.toLowerCase().includes(searchQuery);
        const matchContent = task.content.toLowerCase().includes(searchQuery);
        const matchLabels = task.labels.some(l => l.toLowerCase().includes(searchQuery));
        const matchComments = task.comments.some(c => c.text.toLowerCase().includes(searchQuery));
        if (matchTitle || matchContent || matchLabels || matchComments) {
          searchResults.push({
            type: 'task',
            id: task.id,
            title: task.title,
            content: task.content.substring(0, 100),
            location: `Kanban > ${column.title}`,
            item: task,
            columnId: column.id,
          });
        }
      });
    });
    // Search archived tasks
    (data.kanban.archivedTasks || []).forEach(task => {
      const matchTitle = task.title?.toLowerCase().includes(searchQuery);
      const matchContent = task.content?.toLowerCase().includes(searchQuery);
      const matchLabel = task.labels.toString()?.toLowerCase().includes(searchQuery);
      if (matchTitle || matchContent) {
        searchResults.push({
          type: 'task',
          id: task.id,
          title: task.title,
          content: task.content.substring(0, 100),
          label: task.labels.toString(),
          location: 'Kanban > Archived',
          item: task,
        });
      }
    });
    // Search notes
    data.notes.forEach(note => {
      const matchName = note.name?.toLowerCase().includes(searchQuery);
      const matchDesc = note.description?.toLowerCase().includes(searchQuery);
      const matchContent = note.content?.toLowerCase().includes(searchQuery);
      const matchTags = note.tags?.some(t => t.toLowerCase().includes(searchQuery));
      if (matchName || matchDesc || matchContent || matchTags) {
        searchResults.push({
          type: 'note',
          id: note.id,
          title: note.name,
          content: note.description || note.content.substring(0, 100),
          location: `Notes > ${note.folder}`,
          item: note,
        });
      }
    });
    // Search scripts
    data.scripts.forEach(script => {
      const matchName = script.name?.toLowerCase().includes(searchQuery);
      const matchDesc = script.description?.toLowerCase().includes(searchQuery);
      const matchCode = script.code?.toLowerCase().includes(searchQuery);
      if (matchName || matchDesc || matchCode) {
        searchResults.push({
          type: 'script',
          id: script.id,
          title: script.name,
          content: script.description || script.code.substring(0, 100),
          location: `Scripts > ${script.language}`,
          item: script,
        });
      }
    });
    setResults(searchResults);
  }, [query, data]);
  const handleSelectResult = (result: SearchResult) => {
    if (result.type === 'note') {
      setCurrentTab('notes');
      selectNote(result.id);
    } else if (result.type === 'script') {
      setCurrentTab('scripts');
      selectScript(result.id);
    } else if (result.type === 'task') {
      setCurrentTab('kanban');
      // Task will be visible in Kanban board
    }
    onClose();
  };
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓';
      case 'note': return '📝';
      case 'script': return '💻';
      default: return '•';
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Icons.Search />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tasks, notes, and scripts..."
              className="flex-1 bg-transparent focus:outline-none text-lg"
              autoFocus
            />
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition">
              <Icons.Close />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Workspace: {currentWorkspace} • {results.length} results
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="text-center text-gray-500 py-8">
              <p className="mt-2">Type to search across all your data</p>
              <p className="text-xs mt-1">Tasks • Notes • Scripts</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map(result => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-700 transition group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{result.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${result.type === 'task' ? 'bg-blue-600' :
                          result.type === 'note' ? 'bg-green-600' :
                            'bg-purple-600'
                          }`}>
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-1">
                        {result.content || 'No content'}
                      </p>
                      <p className="text-xs text-gray-500">{result.location}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
          <span>Press ESC to close</span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-700 rounded">↑</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded">↓</kbd>
            to navigate
          </span>
        </div>
      </div>
    </div>
  );
}

// Confirm Modal Component
function ConfirmModal() {
  const { confirmModalOpen, confirmModalTitle, confirmModalMessage, confirmModalOnConfirm, hideConfirm } = useStore();
  if (!confirmModalOpen) return null;
  const handleConfirm = () => {
    if (confirmModalOnConfirm) {
      confirmModalOnConfirm();
    }
    hideConfirm();
  };
  const handleCancel = () => {
    hideConfirm();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCancel}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{confirmModalTitle}</h3>
          <p className="text-gray-300 whitespace-pre-line mb-6">{confirmModalMessage}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImportExportModal({ onClose }: { onClose: () => void }) {
  const { exportWorkspace, importWorkspace } = useStore();
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const data = exportWorkspace();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhub-workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      await importWorkspace(text);
      setError('');
      alert('Workspace imported successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Import/Export Workspace</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition">
            <Icons.Close />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-4">
            <button
              onClick={handleExport}
              className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition text-sm"
            >
              Export Current workspace
            </button>
            <label className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm cursor-pointer text-center">
              {importing ? 'Importing...' : 'Import workspace'}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// Kanban Board Component with ALL Enhancements
function KanbanBoard() {
  const {
    data, addColumn, deleteColumn, renameColumn, reorderColumns,
    addTask, moveTask, showArchived, setShowArchived, archiveTask, restoreTask,
    calendarView, setCalendarView, startTimeTracking, stopTimeTracking, showConfirm
  } = useStore();
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; columnId: string } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<{ task: Task; columnId: string } | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [columnTitle, setColumnTitle] = useState('');
  const { openModal } = useModalPrompt();

  const handleDragStart = (e: React.DragEvent, taskId: string, columnId: string) => {
    setDraggedTask({ taskId, columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    // setDraggedColumn(index);
    // e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    // e.preventDefault();
  };

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    // e.preventDefault();
    // if (draggedColumn !== null && draggedColumn !== dropIndex) {
    //   reorderColumns(draggedColumn, dropIndex);
    // }
    // setDraggedColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (draggedTask && draggedTask.columnId !== targetColumnId) {
      moveTask(draggedTask.columnId, targetColumnId, draggedTask.taskId);
    }
    setDraggedTask(null);
  };

  const handleAddColumn = async () => {
    const title = await openModal({
      title: 'Add column:',
      inputs: [
        { name: 'column_name:', label: 'Column name:' }
      ]
    })
    if (title) addColumn(title.column_name);
  };

  const handleDeleteColumn = (columnId: string, columnTitle: string, taskCount: number) => {
    const message = taskCount > 0
      ? `Delete column "${columnTitle}" and all ${taskCount} tasks inside?\n\nThis cannot be undone.`
      : `Delete column "${columnTitle}"?`;

    showConfirm(
      "Delete Column",
      message,
      () => deleteColumn(columnId)
    );
  };

  const handleRenameColumn = (columnId: string, currentTitle: string) => {
    setEditingColumn(columnId);
    setColumnTitle(currentTitle);
  };

  const handleSaveColumnName = (columnId: string) => {
    if (columnTitle.trim()) {
      renameColumn(columnId, columnTitle.trim());
    }
    setEditingColumn(null);
  };

  const handleAddTask = async (columnId: string) => {
    const task = await openModal({
      title: "Add task",
      inputs: [{ name: 'task_title', label: 'Task title:' }]
    });

    if (task) addTask(columnId, task.task_title);
  };

  // Get all unique labels
  const allLabels = Array.from(
    new Set(
      data.kanban.columns.flatMap(col =>
        col.tasks.flatMap(task => task.labels)
      )
    )
  );

  // Filter tasks
  const filterTask = (task: Task) => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesLabel = filterLabel === 'all' || task.labels.includes(filterLabel);
    return matchesPriority && matchesLabel;
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Get active time entry for a task
  const getActiveTimeEntry = (task: Task) => {
    return task.timeTracking.find(entry => !entry.endTime);
  };

  // Group tasks by due date for calendar view
  const getTasksByDate = () => {
    const tasksByDate: { [key: string]: { task: Task; columnId: string; columnTitle: string }[] } = {};

    data.kanban.columns.forEach(column => {
      column.tasks.filter(filterTask).forEach(task => {
        if (task.dueDate) {
          if (!tasksByDate[task.dueDate]) {
            tasksByDate[task.dueDate] = [];
          }
          tasksByDate[task.dueDate].push({ task, columnId: column.id, columnTitle: column.title });
        }
      });
    });

    return tasksByDate;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getLabelColor = (label: string) => {
    const hash = label.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500'
    ];
    return colors[hash % colors.length];
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex gap-3 items-center flex-wrap">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={filterLabel}
            onChange={e => setFilterLabel(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Labels</option>
            {allLabels.map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>

          <button
            onClick={() => setCalendarView(!calendarView)}
            className={`px-3 py-2 text-sm rounded-lg transition flex items-center gap-2 ${calendarView ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
          >
            <Icons.Calendar /> {calendarView ? 'Board' : 'Calendar'} View
          </button>

          {/* <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 text-sm rounded-lg transition flex items-center gap-2 ${
              showArchived ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Icons.Archive /> {showArchived ? 'Hide' : 'Show'} Archive
          </button> */}
        </div>

        {/* Calendar View or Kanban Columns */}
        {calendarView ? (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-4">
              {Object.keys(getTasksByDate()).length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tasks with due dates</p>
              ) : (
                Object.entries(getTasksByDate())
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([date, tasks]) => (
                    <div key={date} className="bg-gray-800 rounded-xl p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Icons.Calendar />
                        {format(new Date(date), 'PPPP')}
                        <span className="text-sm text-gray-400">({tasks.length} tasks)</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tasks.map(({ task, columnId, columnTitle }) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask({ task, columnId })}
                            className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 cursor-pointer transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium flex-1">{task.title}</h4>
                              {task.priority && (
                                <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ml-2 mt-1.5`}></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-2">📍 {columnTitle}</p>
                            {task.labels.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {task.labels.map(label => (
                                  <span key={label} className={`${getLabelColor(label)} text-xs px-2 py-0.5 rounded text-white`}>
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max">
              {data.kanban.columns.map((column, index) => (
                <div
                  key={column.id}
                  className="w-80 bg-gray-800 rounded-xl flex flex-col"
                  draggable
                  onDragStart={e => handleColumnDragStart(e, index)}
                  onDragOver={handleColumnDragOver}
                  onDrop={e => handleColumnDrop(e, index)}
                >
                  <div className="p-3 font-semibold flex items-center justify-between border-b border-gray-700">
                    {editingColumn === column.id ? (
                      <input
                        type="text"
                        value={columnTitle}
                        onChange={e => setColumnTitle(e.target.value)}
                        onBlur={() => handleSaveColumnName(column.id)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveColumnName(column.id)}
                        className="flex-1 bg-gray-700 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1">{column.title}</span>
                    )}
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                        {column.tasks.filter(filterTask).length}
                      </span>
                      <button
                        onClick={() => handleRenameColumn(column.id, column.title)}
                        className="p-1 hover:bg-gray-600 rounded transition"
                        title="Rename column"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(column.id, column.title, column.tasks.length)}
                        className="p-1 hover:bg-red-600 rounded transition text-red-400 hover:text-white"
                        title="Delete column"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>

                  <div
                    className="flex-1 p-2 space-y-2 kanban-column overflow-y-auto scrollbar-thin"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, column.id)}
                  >
                    {column.tasks.filter(filterTask).map(task => (
                      <div
                        key={task.id}
                        className="task-card bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition cursor-pointer"
                        draggable
                        onDragStart={e => handleDragStart(e, task.id, column.id)}
                        onClick={() => setSelectedTask({ task, columnId: column.id })}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium flex-1">{task.title}</h4>
                          {task.priority && (
                            <span className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} ml-2 mt-1.5`} title={task.priority}></span>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                          {task.content.replace(/[#*`]/g, '').substring(0, 80) || 'No content'}
                        </p>

                        {task.labels.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-2">
                            {task.labels.map(label => (
                              <span
                                key={label}
                                className={`${getLabelColor(label)} text-xs px-2 py-0.5 rounded text-white`}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Icons.Calendar />
                              {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                          )}
                          {task.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Icons.Comment /> {task.comments.length}
                            </span>
                          )}
                          {task.versions.length > 1 && (
                            <span className="flex items-center gap-1">
                              <Icons.History /> v{task.versions.length}
                            </span>
                          )}
                          {task.totalTimeSpent > 0 && (
                            <span className="flex items-center gap-1">
                              <Icons.Clock /> {formatTime(task.totalTimeSpent)}
                            </span>
                          )}
                          {getActiveTimeEntry(task) && (
                            <span className="flex items-center gap-1 text-green-400 animate-pulse">
                              <Icons.Clock /> Tracking...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 border-t border-gray-700">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Icons.Plus /> Add Task
                    </button>
                  </div>
                </div>
              ))}

              <div className="w-80 flex-shrink-0">
                <button
                  onClick={handleAddColumn}
                  className="w-full py-3 bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <Icons.Plus /> Add Column
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Archive Section */}
        {showArchived && data.kanban.archivedTasks.length > 0 && (
          <div className="border-t border-gray-700 p-4 bg-gray-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icons.Archive /> Archived Tasks ({data.kanban.archivedTasks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto scrollbar-thin">
              {data.kanban.archivedTasks.map(task => (
                <div key={task.id} className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                    {task.content.substring(0, 60) || 'No content'}
                  </p>
                  <button
                    onClick={() => {
                      const columnId = data.kanban.columns[0]?.id;
                      if (columnId) restoreTask(task.id, columnId);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask.task}
          columnId={selectedTask.columnId}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}

// Enhanced Task Modal with all features
function TaskModal({ task, columnId, onClose }: { task: Task; columnId: string; onClose: () => void }) {
  const { updateTask, deleteTask, addComment, deleteComment, archiveTask, startTimeTracking, stopTimeTracking, showConfirm } = useStore();
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [labels, setLabels] = useState<string[]>(task.labels);
  const [assignees, setAssignees] = useState<string[]>(task.assignees);
  const [newLabel, setNewLabel] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showVersions, setShowVersions] = useState(false);

  const activeTimeEntry = task.timeTracking.find(entry => !entry.endTime);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handleSave = () => {
    updateTask(columnId, task.id, {
      title,
      content,
      priority,
      dueDate: dueDate || null,
      labels,
      assignees
    });
  };

  const handleDelete = () => {
    const versionCount = task.versions.length;
    const commentCount = task.comments.length;
    const message = `Delete this task?\n\nThis will permanently delete:\n- ${versionCount} version${versionCount !== 1 ? 's' : ''}\n- ${commentCount} comment${commentCount !== 1 ? 's' : ''}\n- All task data\n\nThis cannot be undone.`;

    showConfirm(
      "Delete Task",
      message,
      () => {
        deleteTask(columnId, task.id);
        onClose();
      }
    );
  };

  const handleArchive = () => {
    archiveTask(columnId, task.id);
    onClose();
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      const updated = [...labels, newLabel.trim()];
      setLabels(updated);
      updateTask(columnId, task.id, { labels: updated });
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    const updated = labels.filter(l => l !== label);
    setLabels(updated);
    updateTask(columnId, task.id, { labels: updated });
  };

  const handleAddAssignee = () => {
    if (newAssignee.trim() && !assignees.includes(newAssignee.trim())) {
      const updated = [...assignees, newAssignee.trim()];
      setAssignees(updated);
      updateTask(columnId, task.id, { assignees: updated });
      setNewAssignee('');
    }
  };

  const handleRemoveAssignee = (assignee: string) => {
    const updated = assignees.filter(a => a !== assignee);
    setAssignees(updated);
    updateTask(columnId, task.id, { assignees: updated });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(columnId, task.id, newComment.trim());
      setNewComment('');
    }
  };

  type TaskVersion = Task['versions'][0];

  const handleRestoreVersion = (version: TaskVersion) => {
    setContent(version.content);
    updateTask(columnId, task.id, { content: version.content });
    setShowVersions(false);
  };

  const getLabelColor = (label: string) => {
    const hash = label.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500'
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-lg font-semibold bg-transparent focus:outline-none focus:bg-gray-700 px-2 py-1 rounded flex-1"
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition ml-2">
            <Icons.Close />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Priority, Due Date, Archive */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority || ''}
                onChange={e => {
                  const val = e.target.value as Task['priority'];
                  setPriority(val || null);
                  updateTask(columnId, task.id, { priority: val || null });
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">No Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => {
                  setDueDate(e.target.value);
                  updateTask(columnId, task.id, { dueDate: e.target.value || null });
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-end gap-2">
              {activeTimeEntry ? (
                <button
                  onClick={() => stopTimeTracking(columnId, task.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2"
                >
                  <Icons.Stop /> Stop Timer
                </button>
              ) : (
                <button
                  onClick={() => startTimeTracking(columnId, task.id)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2"
                >
                  <Icons.Play /> Start Timer
                </button>
              )}
              {/* <button
                onClick={handleArchive}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2"
              >
                <Icons.Archive /> Archive
              </button> */}
            </div>
          </div>

          {/* Time Tracking Display */}
          {task.totalTimeSpent > 0 && (
            <div className="bg-gray-700 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Icons.Clock /> Time Tracking
              </h4>
              <div className="text-2xl font-bold text-indigo-400 mb-2">
                {formatTime(task.totalTimeSpent)}
              </div>
              {task.timeTracking.length > 0 && (
                <div className="space-y-1 text-xs text-gray-400">
                  {task.timeTracking.slice(-3).reverse().map((entry, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{format(new Date(entry.startTime), 'PPp')} - {format(new Date(entry.endTime!), 'PPp')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium mb-2">Labels</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {labels.map(label => (
                <span
                  key={label}
                  className={`${getLabelColor(label)} text-sm px-3 py-1 rounded-full text-white flex items-center gap-2`}
                >
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Add label..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddLabel()}
              />
              <button
                onClick={handleAddLabel}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium mb-2">Assignees</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {assignees.map(assignee => (
                <span
                  key={assignee}
                  className="bg-purple-600 text-sm px-3 py-1 rounded-full text-white flex items-center gap-2"
                >
                  {assignee}
                  <button
                    onClick={() => handleRemoveAssignee(assignee)}
                    className="hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                placeholder="Add assignee..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddAssignee()}
              />
              <button
                onClick={handleAddAssignee}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Content (Markdown)</label>
              <button
                onClick={() => setShowVersions(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Icons.History /> Version History ({task.versions.length})
              </button>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onBlur={handleSave}
              rows={6}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono text-sm resize-none"
              placeholder="Write markdown content..."
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            <div className="markdown-preview bg-gray-700 p-4 rounded-lg min-h-[100px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content*'}
              </ReactMarkdown>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium mb-2">Comments</label>
            <div className="space-y-2 mb-3">
              {task.comments.map(comment => (
                <div key={comment.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {format(new Date(comment.timestamp), 'PPp')}
                    </span>
                    <button
                      onClick={() => deleteComment(columnId, task.id, comment.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="markdown-preview text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-between">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm"
          >
            Delete Task
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition text-sm"
          >
            Close
          </button>
        </div>

        {showVersions && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col rounded-2xl">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Version History</h3>
              <button onClick={() => setShowVersions(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                <Icons.Close />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[...task.versions].reverse().map((version) => (
                <div key={version.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{version.action}</span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(version.timestamp), 'PPp')}
                    </span>
                  </div>
                  <div className="bg-gray-800 p-2 rounded text-sm text-gray-300 mb-2 max-h-32 overflow-y-auto">
                    {version.content || <em className="text-gray-500">Empty</em>}
                  </div>
                  <button
                    onClick={() => handleRestoreVersion(version)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Restore this version
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Notes Manager Component
function NotesManager() {
  const { data, selectedNote, selectNote, createNote, updateNote, deleteNote, selectedFolder, setSelectedFolder, showConfirm } = useStore();
  const note = data.notes.find(n => n.id === selectedNote);
  const [showVersions, setShowVersions] = useState(false);
  const { openModal } = useModalPrompt();
  const folders = ['All', 'General', 'Work', 'Personal', 'Ideas', 'Archive'];

  // Filter notes by selected folder
  const filteredNotes = selectedFolder === 'All'
    ? data.notes
    : data.notes.filter(n => n.folder === selectedFolder);

  // Sort: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleCreate = async () => {
    const name = await openModal({
      title: 'Add note',
      inputs: [{ name: 'note_name', label: 'Note name' }]
    })
    if (name) createNote(name.note_name);
  };

  const handleDelete = () => {
    if (note) {
      const versionCount = note.versions.length;
      const message = `Delete note "${note.name}"?\n\nThis will permanently delete:\n- ${versionCount} version${versionCount !== 1 ? 's' : ''}\n- All note content\n\nThis cannot be undone.`;

      showConfirm(
        "Delete Note",
        message,
        () => {
          deleteNote(note.id);
          selectNote(null);
        }
      );
    }
  };

  type NoteVersion = Note['versions'][0];

  const handleRestoreVersion = (version: NoteVersion) => {
    if (note) {
      updateNote(note.id, { content: version.content });
      setShowVersions(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Folder Tabs */}
        <div className="p-2 border-b border-gray-700 flex flex-wrap gap-1">
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1 text-xs rounded-lg transition ${selectedFolder === folder
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
            >
              {folder}
            </button>
          ))}
        </div>
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Icons.Plus /> New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
          {sortedNotes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">

              {selectedFolder === 'All' ? 'No notes yet' : `No notes in ${selectedFolder}`}

            </p>
          ) : (
            sortedNotes.map(n => (
              <div
                key={n.id}
                onClick={() => selectNote(n.id)}
                className={`p-3 rounded-lg cursor-pointer transition ${selectedNote === n.id ? 'bg-indigo-900' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">

                  <h4 className="font-medium truncate flex-1">{n.name}</h4>

                  <button

                    onClick={(e) => {

                      e.stopPropagation();

                      updateNote(n.id, { pinned: !n.pinned });

                    }}

                    className={`p-1 rounded transition ${n.pinned ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}

                    title={n.pinned ? 'Unpin note' : 'Pin note'}

                  >

                    <Icons.Pin />

                  </button>

                </div>
                <p className="text-sm text-gray-400 truncate">{n.description || 'No description'}</p>
                <div className="flex items-center gap-2 mt-1">

                  <span className="text-xs text-gray-500">

                    {format(new Date(n.updatedAt), 'PP')}

                  </span>

                  {n.folder && (

                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">

                      {n.folder}

                    </span>

                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        {note ? (
          <>
            <div className="p-4 border-b border-gray-700 space-y-3">
              <input
                type="text"
                value={note.name}
                onChange={e => updateNote(note.id, { name: e.target.value })}
                placeholder="Note name"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-lg font-semibold"
              />
              <input
                type="text"
                value={note.description}
                onChange={e => updateNote(note.id, { description: e.target.value })}
                placeholder="Description"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
              />


              <div className="flex gap-3 items-center">
                <button
                  onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                  className={`flex items-center gap-1 text-xs transition ${note.pinned ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                    }`}
                >
                  <Icons.Pin /> {note.pinned ? 'Pinned' : 'Pin'}
                </button>
                {/* Folder Selector */}
                <div>
                  <select
                    title='Category'
                    value={note.folder}
                    onChange={e => updateNote(note.id, { folder: e.target.value })}
                    className="cursor-pointer w-50 bg-gray-700 border border-gray-600 rounded-lg p-[2px] focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Ideas">Ideas</option>
                    <option value="Archive">Archive</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowVersions(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Icons.History /> Version History ({note.versions.length})
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-300 ml-auto"
                >
                  Delete Note
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">
                  Editor (Markdown)
                </div>
                <textarea
                  value={note.content}
                  onChange={e => updateNote(note.id, { content: e.target.value })}
                  className="flex-1 p-4 bg-transparent focus:outline-none resize-none font-mono text-sm"
                  placeholder="Start writing..."
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">Preview</div>
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin markdown-preview">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {note.content || '*Start writing...*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {showVersions && (
              <div className="absolute inset-0 bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Version History</h3>
                  <button onClick={() => setShowVersions(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                    <Icons.Close />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {[...note.versions].reverse().map(version => (
                    <div key={version.id} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{version.action}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(version.timestamp), 'PPp')}
                        </span>
                      </div>
                      <div className="bg-gray-800 p-2 rounded text-sm text-gray-300 mb-2 max-h-32 overflow-y-auto markdown-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {version.content || '*Empty*'}
                        </ReactMarkdown>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Restore this version
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}

// Scripts Manager Component
function ScriptsManager() {
  const { data, selectedScript, selectScript, createScript, updateScript, deleteScript, showConfirm } = useStore();
  const script = data.scripts.find(s => s.id === selectedScript);
  const [showVersions, setShowVersions] = useState(false);
  const { openModal } = useModalPrompt();

  const languages = [
    'javascript', 'typescript', 'python', 'bash', 'sql',
    'html', 'css', 'json', 'markdown', 'yaml', 'go', 'rust'
  ];

  const handleCreate = async () => {
    const script = await openModal({
      title: 'Add script',
      inputs: [{ name: 'script_name', label: 'Script name' }]
    });
    if (script) createScript(script.script_name);
  };

  const handleDelete = () => {
    if (script) {
      const versionCount = script.versions.length;
      const message = `Delete script "${script.name}"?\n\nThis will permanently delete:\n- ${versionCount} version${versionCount !== 1 ? 's' : ''}\n- All script code\n\nThis cannot be undone.`;

      showConfirm(
        "Delete Script",
        message,
        () => {
          deleteScript(script.id);
          selectScript(null);
        }
      );
    }
  };

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script.code);
    }
  };

  type ScriptVersion = Script['versions'][0];

  const handleRestoreVersion = (version: ScriptVersion) => {
    if (script) {
      updateScript(script.id, { code: version.code });
      setShowVersions(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Icons.Plus /> New Script
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
          {data.scripts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No scripts yet</p>
          ) : (
            data.scripts.map(s => (
              <div
                key={s.id}
                onClick={() => selectScript(s.id)}
                className={`p-3 rounded-lg cursor-pointer transition ${selectedScript === s.id ? 'bg-indigo-900' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
              >
                <h4 className="font-medium truncate">{s.name}</h4>
                <p className="text-sm text-gray-400 truncate">{s.description || 'No description'}</p>
                <span className="text-xs text-gray-500">{s.language}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        {script ? (
          <>
            <div className="p-4 border-b border-gray-700 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={script.name}
                  onChange={e => updateScript(script.id, { name: e.target.value })}
                  placeholder="Script name"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-lg font-semibold"
                />
                <select
                  value={script.language}
                  onChange={e => updateScript(script.id, { language: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={script.description}
                onChange={e => updateScript(script.id, { description: e.target.value })}
                placeholder="Description"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVersions(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Icons.History /> Version History ({script.versions.length})
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                >
                  <Icons.Copy /> Copy Code
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-400 hover:text-red-300 ml-auto"
                >
                  Delete Script
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">Code Editor</div>
                <textarea
                  value={script.code}
                  onChange={e => updateScript(script.id, { code: e.target.value })}
                  className="flex-1 p-4 bg-transparent focus:outline-none resize-none font-mono text-sm"
                  placeholder="// Start coding..."
                  spellCheck={false}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-2 text-xs text-gray-500 border-b border-gray-700">
                  Syntax Highlighted Preview
                </div>
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language={script.language}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      minHeight: '100%',
                    }}
                    showLineNumbers
                  >
                    {script.code || '// Start coding...'}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>

            {showVersions && (
              <div className="absolute inset-0 bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Version History</h3>
                  <button onClick={() => setShowVersions(false)} className="p-1 hover:bg-gray-700 rounded-lg">
                    <Icons.Close />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {[...script.versions].reverse().map(version => (
                    <div key={version.id} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{version.action}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(version.timestamp), 'PPp')}
                        </span>
                      </div>
                      <div className="bg-gray-800 rounded overflow-hidden mb-2 max-h-40 overflow-y-auto">
                        <SyntaxHighlighter
                          language={script.language}
                          style={vscDarkPlus}
                          customStyle={{ margin: 0, padding: '0.5rem', fontSize: '0.75rem' }}
                        >
                          {version.code || '// Empty'}
                        </SyntaxHighlighter>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Restore this version
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a script or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
export function StatusBar() {
  const { data } = useStore();
  // In Header component
  const totalTasks = data.kanban.columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const totalNotes = data.notes.length;
  const totalScripts = data.scripts.length;

  return (
    <div className="mx-4 hidden md:flex items-center gap-3 text-xs text-gray-400">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        {totalTasks} Tasks
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        {totalNotes} Notes
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
        {totalScripts} Scripts
      </span>
    </div>)
}

// Main App Component
export default function Home() {
  const { data: session, status } = useSession();
  const { isAuthenticated, repoSelected, currentTab, setSession, globalSearchOpen, setGlobalSearchOpen, setCurrentTab, saveToGitHub } = useStore();
  useEffect(() => {
    if (session?.user && session?.accessToken) {
      console.log('Setting session with token:', session.accessToken ? 'Token exists' : 'No token');
      setSession(session.user, session.accessToken);
    }
  }, [session, setSession]);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1/2/3 for tab switching
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setCurrentTab('kanban');
      }
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        setCurrentTab('notes');
      }
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        setCurrentTab('scripts');
      }

      // Alt + S for manual save
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        saveToGitHub();
      }
      // Ctrl/Cmd + K for global search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      // ESC to close search
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <Icons.Sync className="w-10 h-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Not authenticated - show login
  if (!session) {
    return <LoginScreen />;
  }

  // Authenticated but no repo selected
  if (!repoSelected) {
    return <RepoSelector />;
  }

  // Full app
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        {currentTab === 'kanban' && <KanbanBoard />}
        {currentTab === 'notes' && <NotesManager />}
        {currentTab === 'scripts' && <ScriptsManager />}
      </main>
      <StatusBar />
      {/* Global Search Modal */}
      {globalSearchOpen && <GlobalSearchModal onClose={() => setGlobalSearchOpen(false)} />}
      {/* Confirmation Modal */}
      <ConfirmModal />
    </div>
  );
}
