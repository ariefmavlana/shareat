<script setup lang="ts">
import { BookOpen, Utensils, GraduationCap, Heart } from '@lucide/vue'
defineProps<{ program?: string; large?: boolean }>()
</script>
<template>
  <div
    class="relative isolate overflow-hidden"
    :class="[
      large ? 'aspect-[16/9]' : 'aspect-[16/10]',
      program === 'share-book'
        ? 'bg-[#f2e8d3]'
        : program === 'share-knowledge'
          ? 'bg-[#e4edf4]'
          : 'bg-[#dfede5]',
    ]"
    aria-hidden="true"
  >
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 480 300"
      fill="none"
    >
      <path
        d="M0 255Q120 205 250 256T480 230V300H0Z"
        fill="#102d46"
        fill-opacity=".045"
      />
      <circle cx="385" cy="72" r="34" fill="#e6b96d" fill-opacity=".55" />
      <path
        d="M39 183C21 120 42 65 95 35C86 106 65 163 39 183Z"
        fill="#639483"
        fill-opacity=".5"
      />
      <path
        d="M41 183C71 120 110 105 148 111C130 151 88 180 41 183Z"
        fill="#40766b"
        fill-opacity=".5"
      />
      <path
        d="M422 245C428 186 454 162 480 160V280Z"
        fill="#558b80"
        fill-opacity=".5"
      />
      <g
        v-if="program === 'share-book'"
        transform="translate(123 71) rotate(-8 120 100)"
      >
        <rect x="11" y="137" width="235" height="34" rx="7" fill="#234654" />
        <path d="M35 146H237V163H35Z" fill="#fffaeb" />
        <path d="M39 153H230M39 158H219" stroke="#c7c6af" />
        <rect x="0" y="103" width="225" height="34" rx="7" fill="#b76c47" />
        <path d="M23 111H216V129H23Z" fill="#fff6e2" />
        <path
          d="M10 99V2C50-9 88-2 123 22C158-1 194-8 235 3V99C191 89 159 93 123 113C81 91 54 87 10 99Z"
          fill="#fffdf3"
          stroke="#234654"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <path
          d="M123 24V108M29 22Q75 15 104 36M29 38Q74 31 104 52M29 54Q73 47 104 68M146 37Q179 18 214 22M146 53Q179 34 214 38M146 69Q179 50 214 54"
          stroke="#bab8a0"
          stroke-width="3"
        />
        <path d="M177 1V49L187 41L198 48V-2" fill="#086d70" />
      </g>
      <g
        v-else-if="program === 'share-knowledge'"
        transform="translate(115 43)"
      >
        <rect x="20" y="8" width="232" height="157" rx="12" fill="#214959" />
        <rect x="31" y="19" width="210" height="135" rx="5" fill="#366776" />
        <path
          d="M64 193L81 165M207 193L191 165"
          stroke="#a4774d"
          stroke-width="8"
          stroke-linecap="round"
        />
        <path
          d="M65 115L101 90L135 99L183 59M159 59H183V82"
          stroke="#a7eadc"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M67 53H114M67 65H98M164 124H208"
          stroke="#d9e4d7"
          stroke-width="4"
          stroke-linecap="round"
        />
        <path
          d="M49 207H174L199 226H24L49 207Z"
          fill="#fffaf0"
          stroke="#a0b5b9"
          stroke-width="2"
        />
        <path d="M108 207V224" stroke="#a0b5b9" stroke-width="2" />
        <rect x="216" y="181" width="29" height="44" rx="5" fill="#cf8b53" />
        <path
          d="M221 181L215 149M233 181L239 146"
          stroke="#234654"
          stroke-width="5"
        />
      </g>
      <g v-else transform="translate(106 45)">
        <ellipse
          cx="133"
          cy="187"
          rx="114"
          ry="19"
          fill="#102d46"
          fill-opacity=".1"
        />
        <ellipse
          cx="133"
          cy="117"
          rx="108"
          ry="82"
          fill="#fcfaf0"
          stroke="#a4bdb3"
          stroke-width="3"
        />
        <ellipse cx="133" cy="116" rx="87" ry="65" fill="#e5e8d7" />
        <path
          d="M81 134C76 107 93 71 119 71C144 71 157 93 157 132C135 149 103 150 81 134Z"
          fill="#fffaf0"
        />
        <path
          d="M92 127L103 121M111 102L121 98M130 122L140 117M101 89L109 86"
          stroke="#dbd9c3"
          stroke-width="3"
          stroke-linecap="round"
        />
        <path
          d="M159 77C181 55 198 74 190 87C216 91 205 116 187 112C189 139 160 132 164 113C144 112 142 89 159 77Z"
          fill="#47826a"
        />
        <circle cx="178" cy="126" r="14" fill="#ce7445" />
        <circle cx="198" cy="117" r="12" fill="#e7a957" />
        <path
          d="M42 215L21 30M29 30L35 75M13 33L19 77M239 36L248 215"
          stroke="#997451"
          stroke-width="6"
          stroke-linecap="round"
        />
      </g>
      <path
        d="M341 223l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z"
        fill="#c49a50"
        fill-opacity=".65"
      />
    </svg>
    <span
      class="absolute bottom-4 left-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#284e55]"
      ><component
        :is="
          program === 'share-book'
            ? BookOpen
            : program === 'share-knowledge'
              ? GraduationCap
              : program === 'share-eat'
                ? Utensils
                : Heart
        "
        class="size-3.5"
      />{{
        program === 'share-book'
          ? 'Literasi & imajinasi'
          : program === 'share-knowledge'
            ? 'Belajar & bertumbuh'
            : program === 'share-eat'
              ? 'Pangan & kepedulian'
              : 'Ruang berbagi'
      }}</span
    >
    <span
      class="absolute right-4 top-4 rounded border border-white/70 bg-white/65 px-2 py-1 text-[9px] font-semibold text-[#526574]"
      >Ilustrasi</span
    >
  </div>
</template>
