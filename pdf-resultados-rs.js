/* PDFs dos resultados que chegam do site (DISC e formulário da vaga).
   O R&S usa para guardar cada resultado como arquivo PDF no cadastro do
   candidato, em vez de um link para a tela do resultado. O relatório DISC é o
   mesmo que o candidato baixa ao terminar o teste (copiado de /disc/). */
(function(){
const DIM = {
  D: { name: 'Dominância',   short: 'D', color: '#9B6B52', bg: '#9B6B5215' },
  I: { name: 'Influência',   short: 'I', color: '#B08A3E', bg: '#B08A3E15' },
  S: { name: 'Estabilidade', short: 'S', color: '#6B7A5E', bg: '#6B7A5E15' },
  C: { name: 'Conformidade', short: 'C', color: '#5E6E7D', bg: '#5E6E7D15' }
};

const PROFILES = {
  D: {
    title: 'Dominante',
    summary: 'Orientado a resultados, direto e decidido. Assume riscos, lidera naturalmente e foca em superar obstáculos com agilidade.',
    full: 'Pessoas com perfil predominante D têm como força central a capacidade de tomar decisões rápidas e assumir responsabilidades. São naturalmente competitivas, têm alta energia e se motivam por desafios concretos. Comunicam-se de forma direta e objetiva, preferem autonomia e tendem a ser impacientes com processos lentos ou burocráticos. Em ambientes profissionais, costumam se destacar em liderança, vendas, gestão de projetos e funções que exigem iniciativa e resultados.',
    strengths: ['Tomada de decisão rápida e segura', 'Foco total em resultados e metas', 'Liderança natural e assumo de responsabilidades', 'Alta energia para iniciar e conduzir projetos', 'Resiliência diante de obstáculos'],
    challenges: ['Pode ser impaciente com processos detalhados', 'Tendência a decidir antes de ouvir todos', 'Pode parecer insensível ou autoritário', 'Dificuldade em aceitar muitas regras'],
    motivation: 'Metas desafiadoras, autonomia, reconhecimento por resultados concretos e competição saudável.',
    ideal_roles: 'Liderança, vendas, gestão de projetos, empreendedorismo, áreas que exigem iniciativa.'
  },
  I: {
    title: 'Influente',
    summary: 'Comunicativo, entusiasta e com facilidade natural para engajar pessoas. Cria conexões com facilidade e transmite energia positiva.',
    full: 'Pessoas com perfil predominante I têm como força central a comunicação e a capacidade de influenciar e engajar. São naturalmente otimistas, expressivas e sociáveis. Criam conexões rapidamente, adaptam-se bem a situações novas e tendem a ser motivadoras para as equipes ao redor. Em ambientes profissionais, se destacam em vendas, comunicação, marketing, treinamento e liderança participativa. Podem ter dificuldade com tarefas repetitivas, detalhes técnicos e ambientes solitários.',
    strengths: ['Comunicação clara e envolvente', 'Facilidade para criar e manter relacionamentos', 'Entusiasmo que motiva a equipe', 'Adaptação rápida a mudanças e novidades', 'Criatividade e pensamento inovador'],
    challenges: ['Pode se dispersar com facilidade', 'Dificuldade em manter foco em detalhes', 'Pode evitar feedbacks negativos', 'Tendência a prometer mais do que consegue entregar'],
    motivation: 'Reconhecimento público, aprovação social, variedade de tarefas e ambientes colaborativos.',
    ideal_roles: 'Vendas, marketing, comunicação, treinamento, RH, funções com alto contato com pessoas.'
  },
  S: {
    title: 'Estável',
    summary: 'Paciente, confiável e cooperativo. Trabalha bem em equipe, valoriza relações duradouras e mantém a consistência nos projetos.',
    full: 'Pessoas com perfil predominante S têm como força central a confiabilidade e a capacidade de manter harmonia e consistência. São pacientes, leais e excelentes em criar ambientes de trabalho colaborativos. Constroem relações sólidas ao longo do tempo e são referência de estabilidade para as equipes. Em ambientes profissionais, se destacam em funções de suporte, atendimento, operações, treinamento e liderança servidora. Podem ter dificuldade com mudanças abruptas e com impor limites.',
    strengths: ['Confiabilidade e consistência nas entregas', 'Capacidade de manter a calma sob pressão', 'Facilidade para trabalhar em equipe', 'Dedicação e comprometimento de longo prazo', 'Criação de ambientes harmoniosos'],
    challenges: ['Resistência a mudanças rápidas', 'Dificuldade em dizer não', 'Pode evitar confrontos necessários', 'Tendência a acumular tarefas sem pedir ajuda'],
    motivation: 'Ambiente harmonioso, relações de confiança, segurança no trabalho e reconhecimento pela dedicação.',
    ideal_roles: 'Atendimento, operações, RH, suporte, treinamento, coordenação de equipes.'
  },
  C: {
    title: 'Conforme',
    summary: 'Analítico, detalhista e orientado à qualidade. Segue processos com rigor, toma decisões embasadas em dados e entrega com alto padrão.',
    full: 'Pessoas com perfil predominante C têm como força central o rigor analítico e a busca pela qualidade. São cuidadosas, precisas e altamente comprometidas com a excelência nos processos. Preferem ter todas as informações antes de agir e identificam erros e inconsistências com facilidade. Em ambientes profissionais, se destacam em funções técnicas, financeiras, jurídicas, de qualidade e controle. Podem ter dificuldade em ambientes com pouca estrutura ou que exijam decisões rápidas sob incerteza.',
    strengths: ['Entregas com alto padrão de qualidade', 'Identificação de erros e riscos com precisão', 'Disciplina para seguir processos e normas', 'Análise aprofundada antes de decidir', 'Capacidade de documentar e sistematizar'],
    challenges: ['Pode ser perfeccionista em excesso', 'Dificuldade em agir sem informações completas', 'Pode parecer distante ou muito formal', 'Tende a ter dificuldade com ambiguidade'],
    motivation: 'Padrões elevados, clareza nas regras, reconhecimento pela qualidade e acesso a dados e informações.',
    ideal_roles: 'Finanças, qualidade, tecnologia, jurídico, auditoria, controle e funções analíticas.'
  }
};

const LOGO_PDF_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAFACAYAAACFo7oqAAAy8klEQVR4nO2deZRcdZn+P9Xd2UMSEiAkBAgQIewBZBeQVZBNEEd+ihvihoKKyuhxnFEZdXDX4QjojCujgmwiEDYFDIiABCFh3yHsSYCQPb38/njuy71dXV1d3V23u5bnc06d7q66de+tpb/PfffC9GlTMcYYY/KiZbhPwBhjTGNjoTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmOMMblioTHGGJMrFhpjjDG5YqExxhiTKxYaY4wxuWKhMcYYkysWGmPyo5DcjGlq2ob7BIxpYLrKPJYVoHLbGVP3WGiMyYcNge2BZ4FXklsnqahkxaUFCU8nFh3TgFhoTLNQYGgX8d2AbyTHbAHWAE8CjwILgTuAV4FlQEfmeW3Jcyw6pmEoTJ82dbjPwZg8iThJ5xAfdzPgLcCmyLpZH9gguW2UbBOCcw/wDPAUEh7QObdgwTENgIXGNAtbAouAtcN0/IlIcDYCZgCzgG2BnZD4PIUE5x4kPvMzz414jgXH1CUWGtMo9BZc3wjYHFkMi4H2ITyfFlKrpKPENhsCU5D1sxtwOLAx8DQSnjuB64AnivYLFh1TR1hoTL0TC3p2IR8FTAYOBZ4H/gasGPpT60ah6FYseAVgPLAHcDywC9CKLLB/Ar8GFgCrk+1bSWM5xtQ0FhpTrxQLTBuyXEYnt0nAw8iSqUUKmZ9d9LRQNgHeDuwHzAbWA+YBFyH32svJdm3oPbCFY2oWC42pJ7IFkHElPw5ZLpuiq/1ngOsp7aqqdUplxrUBR6LXuB96vbeg1/gXZLHZnWZqGguNqQdKLcBvAvYBxgCvoTjGXcC65PEWSlsK9UKxxTYaZbEdARyGXGf3AJchKyf7vHp9zaZBsdCYWqZ40ZyNFtltgYfQlf3zqCgyaKU+rZneKKDXFDGdcej1nwzsD6xEgnM+8I/Mc8CCY2oEC42pVSJbqxXYAfhY8nMB8EvgXlQECalLrZ4tmL4oFZM6FPggEp4VwLXovXmS4asfMqYHFhpTi4RVMgE4DXgf8Bi6ar8is10zXrkXv+YJ6P15O6oVehI4F7iSVKgbycIzdYiFxtQaYclsAXwNFTReCvwGxWHqPfZSTbKuxe2B96JaHFDs5n+B50jfU2OGBQuNqSVi4dwdOAu4D/g58ABaKNsYuoLLeiEbwxkFHIXcjNPR+3cucFNmWwu0GXIsNKZWiKvuw5C77ALgYlK3j6/Ky5N1kc0CzkBZeWuA3wLnJb/7fTRDjoXGDIQITGdb2w/mSjkWyYPR1fjZKFUZ7CrrD9kEgFaUmfZ+VOx5C/B14CUctzFDjCdsmv4QbpoutFC1kwpNKwP7PsWitwdwEloM76J7YaZFpjKiJU0Bvac/Az4PPAgcAPwQ1R91kF4oGJM7tmjMQFgfNYEchyrx7yftwZWleCErFoxw4+yIsqYuQfNaHEuoDiHimwFnAgeihIqzgNvx+2yGCAuNqYQQhJnAB4A5qLX9CGA5mh55b3K7CVXqlyPr4tkG2Atllr2OYwjVJsRmIvBZ4F2oT9q3gauH8bxME2GhMX0RC9UJwEeQENyLMprWoEaWeyHrpg0JyP3oivle1PJ+LWoNs5buWWNTkHBdiKr7HTvIh3hf24CPA6egAs+zUV2Sxd3kioXGlCNcKyeg+MnlwB+RBVPM5qjmZWdk+UxDKbajgUdQe5T10IJ3OWp9fzJylf0dWTNgV05eZMXkJOAzwCrgP1BzTou8yQ0LjemNEJnZwKnA91HVeTxWTLFAzEZisynqOtwBLEGWy70oxjMGpd2+iuMFQ0G2q8CJwBfRe/9FJPb+DEwutA33CZia5/3Ad5ELrNzsk2zKcxfKdFoOHJM89yLURqYdNYMEmItFZijpIs0c/D0wEvgcSg44A/WRsxvNVB2nN5tSRArzMcBSJBQtSCR6E4RIeY6fuwB/SPZ1Puq23A68G7nW/onGFVtkhpb4fFrQ1M5zkOX5TZT63InXBVNl/IUyxcTCPwqNFJ5LZWLQQmrxbIyymm4ATkdFgqCCzM1Rxf9klEzQSlqD47qOoSM+z5+hNjUzgX9Hk0mjFseYqmChMcWE6+RYZMk8THmRCYHpRBbLTOAnwHwUaI7v2HbJY99GxZlHoqyzdiROUZgZ+wsBaiu6tRRt4wVxYMR7XUAW52XICv0SMBYLv6kijtGYLCEy6wPvAH6K0pLLWTSdyW02sCeK6SxCFf7x+O7ILXNBcowFKBEg2tk/g9xoi1ANTiUxAscRBk9YLu3Aj1Bh5xGoqPM80osEuzbNoLDQmCAbBD4ZpSTPI43XlGIi8FaUVbYdsAlwIxKZFck2B6G055+SusqWALciEVuTPPdY5E5bASxGRYUdwEZI+LpQ94G/okLR3ZHFdRtqWRP1OY759I9IEFiCPrdzgI+i9/Zq0l5zxgwYpzebYt6P2sF8EZgK7Ipmw6xFY4MXo4yyLYB9k22WAwuRdXIfaRPMQ5C77AIkEtkr5EOQFfQTJD5jkKjshboPjwdmIMF5BHg82fcStDCulxx7R5RCfQ2q1Ylgti2e/hHv2d4olX0d6qJ9DxZvM0gsNCbYAlky+yBL5u9okXm+n/uJRelgJBjnF90fjAK+h8Tk7uQ49yOxKNU3rRxjkatvGUpAWI0LEAdCiM2JKFazAHUSWImF2wwCC01zEwvLZOQyeQVNZZzfj30Uin7vRLPsN0TpzaViPPH3eqi78J7AVqiLwNXAd1DHgDi/7DG6ivaR5c0o0eB3yWuxZdM/ohZqFErkOApdKPwYWzVmEFhomptYPMYj6+Me0mwkqHwOTHYR+jBa3H/Rj/OYiSybXdHV9EuoRcqTVCYWsUB2oNjNUcD1aAaL6R/xfm+OUp/XQ8Wct2HhNgPEQmOK6a/LKdvW5DPIOvoqqfCUE6pCiW22A/4TxWLOoLKOztENOopKp6P+bOvQYtmOr8j7Q7zfxwNfQcW1Z2Ar0QwQ19GYIGpSBhLX6ELt53dG7WrC3dXXwh6PtyTHB8Vp3ocWtWOT+2JiZNTSZGtsIisu6ngAngOuQum6v0BJBpFdZfomPr9LUcxrb9TRwXVLZkA4vdkEgwmcbwAcDnwDBeT7YxUVu+daUIrzmUi8DkMZbc+V2cdEJCrT0EK4BmWitSSPbYncceFeM5XzY1TI+S8otfx+bNWYfmKhMYMhrJaTUAD+UQaf7RULWAElE+yKAvwzkRttGbJ21iEB2QplnS1DqddPo2ypm5L9TEZZUwzyvJqNsACfQQki3wKOQz3rOrAr0vQDC42B3heNUjGUIK5qt0DicgPVtRgiKWE+aoOzG7JYtkzO6xVk+fwNjR54BjUADcLNk73PDIw/o8SK49GgtAXDezqm3rDQmKwFMpI0/rGaNOZRKgstROgwNAwNqn+FG8WXy4GbM+eS7a2WJfpzdZK+pqhs99V3/+lC7/VLwCXA11DXgNOG86RM/WGhaW5CZCYD70RpzuNRautiNHnxftSDLIjvTAeKg7yILArIZzGPwHQISCfqUhBkRbBU3MCxhMER7//1qBHqvqirQ1iwfn9Nn1hompfIMNsTzZB/BPUfa0eFkxuj+MgM5JZajVxYL2b2sS8K0q8iX599OYvEC12+RMbfcuBCYA6Kyd2Kki4cqzF9YqFpTmJxOBy1GPkZSgcuxQRgG9SL7FBUo3Iz8tNviDLCsvs0jUcE/29AcZpdgANQf7k2erowjemGhab5CEHYDl2ZfhUV5LWRWg7hqgJlc92Z/L4+qqn4MHKx3YsyzSh6DvSst6ikgNPUNl0oE3A/1LX7OpyBZirABZvNRVTPj0RzR85GIhMV9TGArCP5uz3znBaU6XU16oP1GMoAi+ywGOMct86iW9wfw8tMfRFCcgtys+6Bxj9kWxYZUxJbNM1FG6o/ORp1Z15AGmTvjWx8JDK41qFBZo+ihIDVyNp5HtWsTEbTM8cisVoBvJo87rkx9c1aNPbhB6jT90IcJzN9YKFpDsKttQ751icg/3or/VskQhg2QAvOr1DbmTuQuOxMWo0/KjneMyiDbSYSuBY0NvgFLDb1RnxetwEPoM/zEpQg4gw00ysWmuYgrJJ3ATsA36bnzJdyxZnxeDy2K8o6egSlunaiBIGNUdLAShTbWZV5/jjkatsa+Dc0xvk+vEDVExG/exEVbp6JumVfiS8YTBksNM3BFsDpKHvsPFLf+rPI2lhL6QLHQuYWj++JWsHE46OQZdSCrJRiwn+/ArnqFiCLag4SGotMfRHxuLvQ5304so6deWZ6xULTuESV/DFocuZrKPA/Cy0OW6BU5RWoWeKtaPGI5pUj0OIRQjA+2VcMNDsEic04Uhdcqfny2d5lkQr7DKrVMfVHfL4Po6zDtyBXaqmLDGMAC02jEgH+kchi+QLwYNE22wL7AweidvzvRIPPzkcNKWMy5qbI3fYh9H35MBKUEcl+JtLd7dabCyUy0bqATUi7CZj6Igo4lyKLdB+U7nxx8rhdaKYHFprGJP7Z1wLzkt/DwonHH0huVwJ7oZ5l+6CU57+hK9QpqDvydNSO5scoxXkr0maVk1B2WSWE2yUy1OI+u8/qk/noe3AYsnI9q8aUxELT+ESMpHgxj2Fjz6LMoRuR5XIYMBtZHeuS+68AHieNy8xI/gaJ2VtJOwRUwgTs069nov/Z7ej7sw2aB/Q0vnAwJbDQND69/dNHIWVYOktRrOYW0sWieOJmFG5uh1KbQbU0xwC/TfZRbqGJ+zvomfVm6ocudJGyBsX9tkRW8dPYqjElcEWviU4A2Q7J7Zn7oXv7/ULyeAwTuwUlCnwJpTaHePV2LFCDxpW9bGPqg3DP3oG+E9snf1toTA8sNM1LoegG5Tskx2ObofkksY9/oJ5XRwBfQVlpETAu7n0W7UpeQLGecsc0tU1cNCxAFx6boUzCuGgx5g0sNM1LV4lbMcWNMkHprNsWPf59FMv5FzTydwZp7zOK9jEC+fWXDfoVlKbUOefxHCNeRi6zqShl3r3PTA8co2kuwqoYD5yKFvvnUPuYpcjf/hLpcLEQirbkNhoVe26U3B/NOJehav/bkdj8DLlUrkC1ObH4dJEKUF7fvYFYSLaqBsd89LnPQpmMFm3TDQtNcxGFle9DUzMvJs0k6wKmobqaxajupi15zkSU0hxFlzNRhtpCZKF0oILQC1BSwNHAicDXgSdQWvTDybbrkv1NRFfD1WQE6lSwJjlOpbSR9mZb28e2pifzgY+gpACwcJsiLDTNQ1gf2yW/X0rPRfXp5AayWqYiobkPjQXYDngILST/BXw6uR/SsdCdwB+T22wkaueh0QLzSJturl/l19aJOkofn7yuGEewPPk7684Ji2oCEpdOJFJz0aJpKiMuUB5A4r45SgjJe+KqqTMsNM1B/NOPQZbJ9Si9uDgVOevyeIk06B/fk31Ru5EvA58BvocW5/9DC3p2HwVkFX0Ztbz5QLLN3agDwR7Jz2pYELGgPYde23hUSDoFdT2YhRa/cN+NQoL6R9Qg8lXUv+1pzEBYht7HacgN+ywWGpPBQtMcxD/8NOQWe5jS9S7ZhSE78Gwd6mk2jrSVzTeQ+2x/lABwB3KbdWT2HVbENSg76d2oi8BtyLW2MdVZ3OO8X0VxoiyXAt9EsaUVqC3PyyimdH8Vjm1kKT+BXKrjh/dUTC3i7JDmYRQaw3wHfc+hia4BHUhkokhzFWqI+RYkRAuBnwBfQ1bD+ahdTYhMpEVHB4Lzkbvqvcl9OybHq1bwuJDstxVdREWvt1uTxyPedDMSmUhyiOc4iN0/sq2OnkGu1gnJfX4vzRvYomkeJiGxCYujmLBeIjMs4hY7oKrvu5FIbUwaXwkxWoxiMJ8CzgE+h65wC5n9FZBFMRcJwDTSgtBquVjiWEGIx/OknQhGZM4N3AqnGrSj5JKJyOo1phsWmsYnFvutSEcAFLvIouo/rJztUYPNrZEo/BW4Ew25mopiN12Z7WPRPgdV/H8J+CwSliB7zLXAU4N7WRUR9UGrkACNTI7djuMH1SK+X8/Rvau3MW9goWkeZiCLJIgFIm6zUHPMHVFg/CUUW7kLxT52RyKyFQriZ4kU6Vbg58hXvzPqAt1bULivbgTVJCssWUE1gyc6cr+I3tcxyf0WcvMGFprGJxb6CfSc7V5AWVnHoqv9O1EtzOPAksw+WtGV6hTU1Xlxcn92MQnBakEt4+cgoemNoVyIHC/Ij/gcV6Dss9FF9xtjoWkSsn3GOtHnvisa7zwduBp1Y3656Dmx/SjkfpqA0pv76s78MHBcVV+BqXWiI7fXFNMDfykam4i9bIquNlcgF9qHUHrxQ8C/Iksm+xzoPhFzIqnYjCMddFbKLVZItt2gui/F1DjtpIWyxnTDX4rGJvznO6E6lt2BM5E1cznwQ5SWmnWnlRKONlQf8RpaUHYAHunleJ3IFVft9jKmtgmhaR3uEzG1h4WmOWhBxZL7I/fX2SgWs5Lyg8rCInodxXCeR1bRgcBldLdosrGgg4DvJPfbV98cdKA2NBYa0wMXbDYuMR1zEnAkmoK5ABVL/pTKReYQ1CxxBEptvhLYBY3vzVb/tyJROQKlQ7vqvrloR0ITF6++wDBvYKFpXCLWcjhyaXwA9Sd7OPN4uTTfiM18ELnXHkcp0L9HNROnkU7eDBfdqOS5c4vOwTQuISjRRcIWjemBhaZxCRG5EmWXLaSyaZqQfi8OQhM0X0bWUBfq6vxFVMx5KmmngSgKXYQmaPZ1DNNYRHq7Ly5MDyw0jc9yUsujt0maxcT3Yis0pjkEahnKYHsCWUcHobb80cZlAukVrb9bxhjAi0EzEC6y/lgXWXfIUlKBWod6nbWiGMwXkdC8Ndl+FGlTRVszxhjAWWfNwGAW/JfpnlW2EtXHREfmh9FMmrNQsd5KNOzMs0iMMW9gi8aUI3sh0oXaz7yOLKSIzdwN/AD4CnAA6ZhmsL/eGIOFxpRnMkprLiS/H0o6qCxccgXgzygb7b3IohnbY0/GmKbFrjNTTNTfFFATzYjvfAG50h6gu2usC32PfoMSBd5P2sHXLjRjjIXG9Mp6KA6zDAX79wI+Qvd05iCGjf0IxXBGYYwxCRYaU0xYIdNQ2vI0NDnzB8CjpFM1s0T9xArgjMz9nvtijHGMxvQgAvgbosD/Z1HR5xWkbrVS2EVmjCmJhcYUE0IzCtgDWTG/pKe7zBhjKsJCY3pjOnKtnoeD+saYQWChMVmyrrGpwPmoCNNCY4wZME4GMFmyTRF/iqr9435jjBkQFhpTTIjKshL3GWNMv7HrzPSG28cYY6qChcb0hq2Y/pOd92OMSbDrzJjqYXE2pgS2aIwZPDHsbSdg++R3WzbGJFhojBkc2dTvo4E5ye/+3zImwf8MxgyeTmAc6na9aJjPxZiawzEaYwZHtjfcZsBrw3guxtQktmhMM1LN+ElXctsSTRZ9JXO/MQYLjWkORpA2BY3fq0G2AekpwGJgTZX2bUzDYKExjUwL6RjqEaSjp9fPbFMYxC2smQ+jJIAV9D5GwZimxUJjGokCSjUOS6MDCcGbgLHJfauAXdG46XZSsRjIbSSyZE5EzUfbgXXJcew6MybByQCmkeiiu0XRBswGdkMC04GC9XsDnwAuRlbI2uRWiTUyGo253hL4ALAz6gs3sh/7MKapsNCYRiDiL5sBhyEhmAzMQCIzBolAWPBdwGnAZ4AXgSUoiL+a8sSI61lIcNYgC2YscsfNT+5zsaYxGSw0plHoQov/eGSlLAceB66j+/iDoDO5vw2521qozJXcjkSrizQG1Jkc+8HkMc/vMSaDhcY0Ap3Jz4eS23BjkTEmg4XGNBItyDoZjoU+LBvHaIwpwkJjGolOUuvGGFMjOL3ZGGNMrlhoTG84c8oYUxUsNKY3HNA2xlQFC40pxVhgC9TDyxhjBoWFxmSJ78MBwEJU9Q7pBEljjOk3FhpTinXAq6g40RhjBoWFxpSiuDmlMcYMGAuNMcaYXHHBpjEie9HVV8Zd1tKrVoFozLgZruMbkxsWGmNEfxbsPFK/Y8bNcB3fmNyw0JhmJzotz0Zp3YtR9+cuundhzv4+DpiCOjU/gpInBtqxOZ43Htgazc15lfIjoWMsQRfwMO4YbWocC40xIgakTQU2JB0FkHVTxSiBV4HngPuBJ0inag6G8cC+wKTktgkappadAtqWHP+l5PhPAU8m52pMzWKhMc1OWAFXAdcia+Ek4D3o/6ODNH6yAvgR8Ge0uK8jTQEfqDURz3sROD85ZhswEXh3coux0S8Dv0jOdW1y7MEe35jcsdAYI9Ylt1VITF5CUzjbkdhMQqOfL83p+F2kI6VB46G/C2wFvBlZLl8G7svp+MbkhtObjelO1BD9DvgbGgMd7rP1gBGZ7YaCdpSocA4SGXdpMHWHhcaY7kQ8pAD8HliJxGUlsD9yaeVNiNg4YCfg78C85DxqOZ25P5lzpomw0BjTk060YN4F/JM0VrMRcGiyTZ4LagjNwcm5XISy0DpyPu5gKCDrb+Rwn4ipPSw0xpQm0oUvJE0GWAOcgBbUvGkFjkQJALeSjoquVdqBB4Dnh/tETO1hoTGmPHcCC5Dbqh2YTmrV5PH/04oEZQdgFkpAqGXCwnoN+DxyNxrTDQuNMaWJOM065Loag1xXrcDR6H8nTzfWgcgNdU3mfGqdVrymmBL4S2FM3/wDuBfV2KwF3gTshxb/amaBtZDGgvZDdT3Lqrj/vOmgtt17Zpiw0BjTOyEkS4CrkYWxFmWevZ3qWzWRBDAHdSqImh3/n5q6xl9gY8oTQjIPeAi1ilmB2tXsgq7gq2HVFJBFMAI4JjneE0XnYExdYqExpjwhJIuA29D/zFrUE+0AlPpcTSGYidxmc1GXgtYq79+YIcdCY0zfRGLAZag1zVjUWPNwYFMkRoP9XwoxORJ4GmW7Ze83pm6x0BjTN51IaJ4CbicN2k8FDspsM1hGA8cht9nzpKnOxtQ1FhpjKiOsmouA1chlthwJw6Rkm4H2P4uC0MNRrc4N2JIxDYSFxpjKiD5eDyC31khk1WwMHFKl/R8LPA7MJ7WajKl7LDTGVE5YLL8nDdK3I6tmBAOzQiJFentgM+A6hq4ztDFDgoXGmP6zEGWgjUWdAzZHlfzQ//+p2P5YJDBXIuFxbMY0DBYaYyonCjhXAX8k7X82GngHAxOZcL+9GVkzq6p0rsbUDBYaY/pHJAXMR7Ga9ZA4zAb2QZZIpZNro0P0Xsgquog0McCYhsFCY0z/iJqZJcDNyX3rgClofkwMJ+tLLKITwOjkeXei9Glnm5mGw0JjTP8Jq2YuyhIbj5pf7gdsTWUFnCFEWwFvBS5BwpN3V2hjhhwLjTH9J2vVzEPCEF2XD8xsU86qiWD/YcCTwN15nKgxtYCFxpiBEUJyGbAU1dW8jro6T6e8VRICNAElEVwDLMadAEyDYqExZmCEkCwCbkEJAO3ANFKrphwF0pk2N/exrTF1jYXGmIETYnMhSghoQRloJ6Aam4jllHpeF3AScA/qNuBOAKZhsdAYM3geA25C4tKBXGe9taUJ4dkBWT9/Tp7jlGbTsFhojBkckSV2KWlSQAF4J6XFI/7nTgReQ/EZsDVjGhgLjTGDI9xjDyKrZiLq7jwTWTXRTYBku05gA2DHZPu1NI410yivw1QZC40xg6ML/R+tQO391yHrZALwNpSNFkQjzkOR2Fw8pGeaP67/MSWx0BgzeCLV+VZUDzMRpTrvBsxBwhMdA8agbLN7gGeS59f7Ah2WTCvdhdUYwEJjTDUIq+Z15A5bg0RlMkp1jjhOJxoHsCfwGxqjr1mc/0jgc+j1QeouNMZCY0yVCKtmLvA0slxeR0KzJWl7mQOTx++j/i0ZSN2BRwK7A88l9zfCazNVwkJjTHWIpIBXkVUTQ9E2AQ5K/t4QOBr4E+qNFt2ba40WKrO0WtBr3Bw4BYnn4uSxWnxdZpiw0BhTPaJ9zCUodTna0rwDWTi7IQtgXrJdrf7/ddK3UEQG3WbA6cBdKIOug9TKMQao3S+6MfXMS8D1SGjakSVzDPBe1K7mcbQY11LtTDbWsiswKfm71BoRMacpwFnAHcBDwCtF+zIGsNAYU20iwH8RqqcpoLY0H0dutOgEUKuMRUH9kzP3FYp+70RC+WXUUPRCNADu8WQbWzOmGxYaY6pPFwqKz0ULcAdKeX4auc1isa5FOpB4nEI6MTRLCOmH0Cyd/0CiMwJ4IdnGQmO6YaExprpEqnM7ai+zCi3Ea4C/JX/X8nCzlcAjqNPB6WjGTpxrCxKeSHD4EkpqGI9iUUuH+mRNfWChMb0RC2b8bion3rv7gb+iWMZrwOXJ47VozUTWXAcSxV8BtwFfoWcW2uZo9PT9yd/t6PUtz+zLmDew0JgssZjEQjFmuE6kzolFexWKyawC5lP7rqVYD15DYnguMAr4DOloA5AF81Rm+7Zk+5VDdaKmvrDQmFJ0oEVl9HCfSB0TXZxvBD4C/JD6yMYqoFqYlShd+Quo4PSDpAIat7DMRgFTkSXk1GbTAwuNKUXUUYTQeOEYGF2oyebdKOW51t/H+NxXJLcCsm7OQo1AT04ej9dSQGvIeqiJKPRfTCstDjV1jIXGlCKuVG3RVId6WEijS8F4FOx/NPl7BPAi8F3go8DhwPPouxH9244Fnkj2U6mYhkhVUhxq6hwLjSlFBwrwRozGC8HgqIf3L87xQJS8sBi5wdahGMzdwJXA50kbiG4BbIuahN5AZWnb2ThgJ/AmYOuix0yDYaExpViLXCdjh/tEzJCyCXAUcBXd+7BFw9DLUOeAQ5BVszkwDjgHudiyCQPFRFwnHt8zed530Ehr8HrUsLQN9wmYmmQNEpop1F6rFFN9QgA+gQpKF5G6tUh+tqCmmc8BB6PGoZOBfyLrt1yD0Oy+tkHFoAeQpnz/FX/PGhoLjckSC8U6VBMxA/novQA0Nl3IMpmGAv/Q0wUW341/AHugi5Bwq7WX2XcIyATgeJSBNwm4AonMKOrDtWgGgU1VU4rVqN39DNKJifafNybZ6ZgPIfEoxxNIWCahrgBrKG3NhKusA5gFfBsVfy5CbWvOQjGeBcn2tVjEaqqELRqTJRaLpWhB2B9/RxqdSFN+ncpqYGLblShZpIu0YDMrFrHfE1BadBtwBur0/DyyZCajjs+1OpfHVAkvIiZLtE5ZhoRmLCrEcw+r+idEpDfLIQL5U4AlmfuKaUseb0NWL3R3nY1GKdKHAW9DjTfnAd9C36s4l0lIcGwpNwEWGlNMK1qMnkVuj5nAA8N5QqYqRJwtGnqWEpHbgI8B36D3PncboDjNFDRbp4DSkzcBdkFWyvTkePOBs0l7omVrZ7YH7iW1fEwDY6ExxcTC8gy6ct0Btbu3a6M+CbfU7sjddV9yfzYTLD7bW1BB5seA80kvOrLdmyehmpkNUGuaD6BY3irU9fl61Pk5+roVn0fcdgD+XnR806BYaEwxsfiE0Ow2jOdiBk8s4qcA16LA/DzkDs3GRiJw/x3gR8nf5xXtawJyf62H3GV7I7G4D83aydKa/AyhCsslug204wSApsFZZ6aYWBBCaGYgNwnYxVHP3IfaytwFnAjsR3dLJT73pcCnkOXyadJiyi6U8r4cuchaUGfquUhkCkhAWpPHOkibswYhNFujaZxrqv0iTW1ioTHFRBbROuBllFm0Q/KYhaZ+uRXYFSV5XAN8EvUuA1kWbWg9aEGFlGejoszPAf8O7IiskEdR25nHkXtsZPLcAvrOdNC7pVJAQrQ1js80FRYaU4q4Cn0w+X0OaV2EqU8eR+Ok4/dvomaY30LB+3bS0QaRoXYPcCa64DgXeA8SkQmkMZi1dHeD9daNOaycHYDHUIcBcHymKbDQmFLEovEAukrdjvJ9rEztsxa5Q8cgIbgXWStTUeD/NGAnUpdXVjDOTW6fRG6zm9GI55koyWAfJFaQxmSyc2si8WAGsoyeRGLmC5cmwUJjShFNFO9Gwd9NURV39Lwy9cdqVLeyERKCVmSxnorcZHOAH6BEgF3o7v4aAfwBpSkfj2pltkGZZkuQxdOJEkcORXGdbIZZJyrQfCewkLSexhcuTYKzzkw5VqNK7iOBvVD7kWxarKkvsvGTuGhYjdKa/w68HyUC7Ax8D/hTsm0McLsPFWNejJquFgfzX0eCshXKSJuMkgcWIRF6FDXhDDeaaRJ8dWrKUUCZRaORyyPqKkz9MRrVvSzL3BeWawuKs/wcucfWAl9H1ks2NfkhFLdZSioy2djdiuSxO4E/onTqF1DNzVw0fiCOa5oIC40pRwSEl6BMo5lokWgt8xxTm4xB2V6v0z02Eq6tEIzbUALAq2jI2cak1sdK1HE5Ky69xe46UEzopuQ5D1fnZZh6xEJjeiMWj9dQgd9s5Jc39UUIwhhkWcSFQrE4hGC0IvfW99H68PbM49uTDjgrl4VYyPwMi8mB/ybGQmPKEaN5r0Wulzmk82m8cNQXU0ibYJYLwneiz/gq5AKbk9y/IXKDLSeN0/W2n2y3AfrY1jQBTgYwlXA/WnTeBlxAz3YjpnaJBX4iae1KX9tH0sANwHHJ/dsjV9iK5LFxaErmIcD6yX3tqEbnMuQqC5ecp2c2ObZoTF8UUPrqjcBmaHHx/JD6YxzqyA19f3bx+D1IWOL5MXNmT+B3KGFgCnKnvY4y0t6Dkgo+jtytIVzRmibrTmvF8b6mwBaNKUf47DuQRbMIDbK6BAWGTf2wCXA7/XN5dpFar9EHbRfgh6ho8/so/T2+CxOAY4APoWLQE1A35xuT7Yr3bZoEC43pi3B/LETzRQ5DkzevwZZNPTGRtMllcQyl1BhmkHA8hWpj1iKL5USUlTYvs330OluGXKvzgf+HGnd+DNVh/RPV5TxA6nrbH9Xn/Bq71xqawvRpU4f7HEztE4vA21GDxQeBD+LizXogLgYORAWZ56LCy5X0fZFwAKqXeQa1IZqGmnM+RvfWMlnhimLMkSiBYEuUFr8FGi/wKkowmITE539QfY6/Sw2MLRpTCWHVXAu8G6U5vwVVlPtKtLYJEbgRWSSnosyx25GVOgYJQgEF81cDr6DFfylqWTMOJYL8N7JwonC3+HOPeEwLsoCeTW5h/RSQO+1NKI4zN/Nci0wDY6ExldBFeqX6BzTq951opO867EKrBwrIdfUn1NxyNmoLE5ZEAQX+VyPrY0NkcewEjEUxnheTffWVrhz7C+K7cyDKUPskaZKBvztNgIXGVEpccV4HvA/YF/nYr8NWTT2QLbJclNzKsSH6TJchsXkSWT+r+3E8SCd37oy+Jz9N7u+rFsc0EE5vNv2hgFwiv0aB4uNIayj8Xap9su1mWtGFZvYWKcitKKV9KbJadyKtn4n99DWfKOI1XahP3nYoAy1SnO0qayK8OJj+UkD9q/4MHEz3kcCmPohYSnvRLQo1s/NoJqIA/gvIGjkGBfUjey2EKbaPv0NM9kVxoeuSY9uKaULsOjP9IRaWFSiNdR/kRrsVXf3a3149soPDsm6o7JyXPAnLZ2dUN3UdSv54FxKa21HmWnG3gex5RU3NN1BjVn8/mhQLjekv4Sabj7ryngR8ABXvuf9Z/yheeLPNKPu68h+KdOACShy4JPn9QeAs1A1gG5QgsDma1vkQEpMJKKvsMJSx9lXUYcAi08S4jsYMhAj+b4cEZjKqBJ+H6yGqxWgUGxlP2m25C6UmLyDfzgzxGe6f/LwluT9iO+3J3+NQnG5H5GIbh1KjX0HJA5cht5u/E02OhcYMlBCbU9BUxgeA01EQ2VevlbEJGoe8Bi3emwO7Am9G47MLaJG/Gy3iM5JtpqKWLhejhby3Cv+BEJ/deOCjwPmkqcjZbbIB/RhBMA4J4GJSIXRGorHQmEHTCvwY1Uj8GvgOaUqrxaZ3WlAB7HMoxrUCVeAvQ6LzLFqs19L9fWxD1s4BqO/YX5NbZHgN5j0Pi6UTtZm5A/gLvV84FAtO8esbiliSqQMcozGDIQTlu2h649Fo9vxN+Eq2LzqBX6D2+38BHq3wee3IfXYVyvz7HCqw/BVpFulAF/cY6fxeZJ3cQvm4W3bMczF2lZk3cHqzGQyxyDyBelatj9rDb4SHo5UjLIHfIpH5BLIIofJplC2oePJ7SOA/RppAMJCJllG9vxOKu/wvsqYqcYN2lbgZ8wYWGjNYQmwuRcHfXYEvIveOF5zSZMcm/xklVOwLHEoqFn0JRaQfr0Y9yE5FDU9jXHNxh+ZyhPtrAyR656Bg/kCD+L7AMN1wjMZUg1iQpgFno9jB/yW/uwq8POFiHIVqVJ4ibUKZzTYrFu3sELFOFLg/DXiJtO7lUVJB6k3047ObnOzjb6Qxn/5+bnFOdpmablhoTLWIBfPNwLdQPcUP0STGNpwcUI6sEOyU/P4cqksJWkg9EDHpsphPoO7ak1CM5Q7g35Brs5TYhJjsjLo8XIKELiti0LdLLLYNgZmMEhkq7YtmGhwLjakmsXAdhcb8LkcL3UCvkJuVGMPQjlKbn0LjkrPMQOnRo0iF6THk/npb8jO6MH8WWTrZTs1hCR2Kujj/BmW6tZHWyfSXGahQc2/gy8kxjbHQmKoTi9lHgU+jxetM1HLeYtM38R5tguI2a1CSxZTk97HAZijLrw0VR4bl8QqK+VyDWgIBfBi50G6mp1VzBLAxcBHda2W2QNX9GyFLdTGyil4jzUyLcx2Jantmo0mai1E23TxswZoEC43Jg7hiPh0JzpPAl1ArEotN32TfoxZklUxG72kbMAKJznLknmpBrrItUbeG9YHpqBHmq6g9zJ+KjvGOZB/Xkbq89kbthDZFBZvPo5jNQiQoG6Akj82S81gK3IUsqW+hyZ3fxy4zU4SFxuRBXDm3AV9AdRlPAv+KFiPX2PRNdixyfxmNxGZPZLWMRcPGlqH3/gAU/wnh70I96z6BOjtcjayi59BgO5Ltou4ufnYhsfoccuH9Z3K/P1/TDQuNyYu4Kh+N4jTHoSvfM1FzxsHEApqN4nThci1niu8bgep1/g14GNXrPI3cafEZnAx8BMVpfkn/+qi9BVmuH0cWji1W0wPX0Zi8yNZ5fB9dJW+FUp53QAucv3+VUVwMGVln5QolI3NsAnAhcoMdm/x8lLQ55kdQr7r/Bn6CRKavzyWsrVHINfpT0jERFhnTA/+jmzyJwsOlyK1yKTALCc9BpIuSC/yqT7gvt0eZa0cgS+aB5PEuZF2eDPwXsnpGUJlYRD+0A1Gc6CZKp08bA7jXmcmfaInyGhqAtQrFA76KuhD/LrONr4arQ7YD8ypUW3MtmiHUhtKQT0HJA59F/elGUNn7H59TCxKaC5Bl5IsF0yuO0ZihIrtAnQ58ELnVLgTOQwui4zbVZRp6n59FmWNHJfe9hOJl85C1uYL0fc92cM4KT4xobkcidhxynf0eWzOmDyw0ZijJLkjvRv251gfmAj9CWU7OWBo8BZSKfDQSlL+j1OUjkdCMQ5loE5Hraz4azXwfStQIWkk/s/hMRiX7nYXiOqtwI03TBxYaMxzE4rU38HlU+3E3CirfVLSNGRiHoQLOO4vuj1qYUajWZlfUgmYXVHMzH41mvoM0ngMqEN0X2A8J1Zmk7Wrs8jRlsdCY4SLcZJsjsTkUeBElDJyH6jPAC1mlZN+ntyP32F2kgh2JP6WsxXGoIHRP4ASUQPAsqqlZhz6rDVEh503A1/AkVdMPLDRmOAk32WgUnD4BLWi3o8y0hZntsq3vTUrEVNpRKvNXULuf31L6/cpmmkaGWXa7ViQ4J6FWNGOSxx9EHblvyezHFwCmIiw0ZrjJXhXvg+I2c1CQ+iLgcmBR8rgXt+5kuwfMRJl8C9AwtHi8EnEuN5J5E1Rb80rR9hZ9UzEWGlMrxOK1AcqUOh41krwbudMuRxMfbd2IYlfZp4ArUdFluc4BlVDq+YPdp2liLDSmlshmnO2HGjzugdxCt6Gam1sy2zfb4ldsSUxBfcb2Qa7GK0h7l1XrPWm299jkgIXG1BrZhXI9NFvlfai4cBlwKxKce0lFKSZRNqpbrdi1NR65GA9GmV/fIh1uBhYFU2NYaEwtUrywrg98CDgExQzWooSBC1AKbgwFiymUjTLNMxvoB2WHHYW6LHchwf0Z7qxgahwLjallil1Fm6FiwbcAOyaPzwOuQsWGj2e2redYTjTEzBZJHoFciZPQxNLfkRZXOjhvahoLjakXslfsM1Dx4MEoPjEKzVa5B9WOzANeL3p+thdXvSzKU9Fr3BGlLt8H3EhaSGkrxtQFFhpTT4RrLFxJk1Hs5lB0xb8RSsN9CmWrXY3SfXsjXHSQis9QiVBv8ZSJ6PVsh7otP4sKWR8lnRPT6DEp02BYaEw9UuxaakFxnIORa21LZOV0ooX6n0h4FqKK9jUozjNcZC2RAipYjd5ks4C/oBYwy+k+hKz4dRtTF1hoTD3TW6HhtiiOMwcVMk5HTSTXIivhbpSl9QyyFl5DrrZlpKOL8zrfsGDGofY7S5BlNh6Nu365xHPiefXi8jOmGxYa0yj0FoPZBsU4Zia3Wai1SsxiWoOSCF5A8Z1zczy/GAS3LbLAJqHOyktyOqYxNYGFxjQi0ZoFuruZJqI2+dPQWOlNkbWzJbIu5qE06jzOpys5/s7IanmBtK1LPSYqGFMxFhrT6EQCQXamSjAKxUfGJL+vABbneC4jkIssBKaeU7CNqRiPcjaNTnZSZCFz60BuszWkBZ95sw6JTFgwDuqbpsBCY5qJ4oB6qTn3eVsXLq40TYeFxjQzw7HgW2RM09HS9ybGGGPMwLHQGGOMyRULjTHGmFyx0BhjjMkVC40xxphcsdAYY4zJFQuNMcaYXLHQGGOMyRULjTHGmFyx0BhjjMkVC40xxphcsdAYY4zJFQuNMcaYXLHQGGOMyRULjTHGmFyx0BhjjMkVC40xxphcsdAYY4zJFQuNMcaYXLHQGGOMyRULjTHGmFyx0BhjjMkVC40xxphcsdAYY4zJFQuNMcaYXLHQGGOMyRULjTHGmFyx0BhjjMkVC40xxphc+f91UkzgjIsOfwAAAABJRU5ErkJggg==';

function buildPDF(r, salvar = false) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();
  const M = 52;
  let y = 70;

  const INK = [44, 43, 40];
  const SOFT = [122, 119, 110];
  const BORDER = [226, 219, 201];
  const BG = [245, 241, 234];

  const primary = r.primary, secondary = r.secondary;
  const profile = PROFILES[primary];
  const scores = r.scores;
  const minS = Math.min(...Object.values(scores));
  const maxS = Math.max(...Object.values(scores));
  const range = maxS - minS || 1;

  const DIM_RGB = { D:[155,107,82], I:[176,138,62], S:[107,122,94], C:[94,110,125] };

  // Header
  try { doc.addImage(LOGO_PDF_B64, 'PNG', M, y - 26, 28, 36); } catch(e) {}
  doc.setFont('times', 'italic');
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('La Vie Consultoria', M + 38, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...SOFT);
  doc.text('AVALIAÇÃO COMPORTAMENTAL DISC', M + 38, y + 14);

  doc.setDrawColor(...BORDER);
  doc.line(M, y + 26, W - M, y + 26);
  y += 46;

  // Nome e data — ajusta o tamanho da fonte se o nome for muito comprido
  doc.setFont('times', 'italic');
  let nameSize = 26;
  doc.setFontSize(nameSize);
  const maxNameWidth = W - M * 2;
  while (nameSize > 14 && doc.getTextWidth(r.name || '') > maxNameWidth) {
    nameSize -= 1;
    doc.setFontSize(nameSize);
  }
  doc.setTextColor(...INK);
  doc.text(r.name || '', M, y);
  y += nameSize * 0.75;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SOFT);
  doc.text('Avaliação realizada em ' + new Date(r.timestamp || r.created_at || r._enviadoEm || Date.now()).toLocaleDateString('pt-BR'), M, y);
  y += 30;

  // Perfis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text('Perfil predominante: ' + DIM[primary].name + ' (' + primary + ')', M, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...SOFT);
  doc.text('Perfil secundário: ' + DIM[secondary].name + ' (' + secondary + ')', M, y);
  y += 30;

  // Barras
  const barX = M + 120;
  const barW = W - M - barX - 40;
  Object.keys(scores).forEach(d => {
    const pct = (scores[d] - minS) / range;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(DIM[d].name, M, y + 8);
    doc.setFillColor(238, 235, 226);
    doc.roundedRect(barX, y, barW, 9, 2, 2, 'F');
    doc.setFillColor(...DIM_RGB[d]);
    doc.roundedRect(barX, y, Math.max(barW * pct, 4), 9, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...SOFT);
    doc.text((scores[d] > 0 ? '+' : '') + scores[d], barX + barW + 8, y + 8);
    y += 24;
  });

  y += 16;
  doc.setDrawColor(...BORDER);
  doc.line(M, y, W - M, y);
  y += 22;

  // Resumo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Como você age no trabalho', M, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  let lines = doc.splitTextToSize(profile.full, W - M * 2);
  doc.text(lines, M, y);
  y += lines.length * 13 + 20;

  // Dois boxes
  if (y > 580) { doc.addPage(); y = 60; }

  const bW = (W - M * 2 - 14) / 2;
  // Pontos fortes
  doc.setFillColor(...BG);
  doc.roundedRect(M, y, bW, 130, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text('PONTOS FORTES', M + 12, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...SOFT);
  profile.strengths.slice(0, 4).forEach((s, i) => {
    doc.text('• ' + s, M + 12, y + 33 + i * 22);
  });
  // Pontos de atenção
  const b2X = M + bW + 14;
  doc.setFillColor(...BG);
  doc.roundedRect(b2X, y, bW, 130, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text('PONTOS DE ATENÇÃO', b2X + 12, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...SOFT);
  profile.challenges.forEach((s, i) => {
    doc.text('• ' + s, b2X + 12, y + 33 + i * 22);
  });
  y += 144;

  // Motivação e funções ideais
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text('O que te motiva:', M, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SOFT);
  lines = doc.splitTextToSize(profile.motivation, W - M * 2);
  doc.text(lines, M, y);
  y += lines.length * 13 + 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text('Funções ideais:', M, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SOFT);
  lines = doc.splitTextToSize(profile.ideal_roles, W - M * 2);
  doc.text(lines, M, y);

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(180, 175, 168);
  doc.text('La Vie Consultoria · lavieconsultoria.com · Este resultado é um instrumento de autoconhecimento profissional, não um diagnóstico definitivo.', M, 822);

  if (salvar) doc.save('disc-lavie-' + r.name.toLowerCase().replace(/\s+/g, '-') + '.pdf');
  return doc;
}

// Formulário da vaga em PDF, no mesmo cabeçalho do relatório DISC.
const LABELS_FORM = {nome:'Nome',name:'Nome',email:'E-mail',phone:'Telefone',whatsapp:'WhatsApp',telefone:'Telefone',idade:'Idade',
  vaga_titulo:'Vaga',pretensao_salarial:'Pretensão salarial',observacoes:'Observações',technical_score:'Pontuação técnica',
  technical_answers:'Questionário técnico',respostas_perfil:'Perfil e trajetória',respostas_comerciais:'Avaliação técnica e comportamental',
  respostas_triagem:'Triagem',qualificacao:'Qualificação',situacoes:'Situações práticas',ciente_pj:'Ciente do regime PJ',
  ciente_clt:'Ciente do regime CLT',ciente_remuneracao:'Ciente da remuneração',ciente_presencial:'Ciente do trabalho presencial',
  ciente_horario:'Ciente da jornada',created_at:'Data do envio',nota_conhecimentos:'Nota de conhecimentos',aptidao:'Aptidão',
  pontos_teorica:'Pontos na prova teórica',total_teorica:'Total da prova teórica',remuneracao_exibida:'Remuneração apresentada'};
const IGNORAR_FORM = ['id','arquivada','pdf_url','respostas_texto','timestamp','_enviadoEm'];
const DADOS_TOPO = ['nome','name','email','whatsapp','phone','telefone','idade','vaga_titulo','pretensao_salarial','observacoes','created_at'];

// jsPDF com fonte padrão só desenha o alfabeto latino: tira emoji e afins.
function _limpo(t){ return String(t==null?'':t).replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF\u2022]/g,''); }
function _rotulo(k){ return LABELS_FORM[k] || (k.charAt(0).toUpperCase()+k.slice(1)).replace(/_/g,' '); }
function _valor(k,v){
  if(v===null||v===undefined||v==='') return 'Não informado';
  if(typeof v==='boolean') return v?'Sim':'Não';
  if(k==='created_at'){ const d=new Date(v); if(!isNaN(d)) return d.toLocaleString('pt-BR'); }
  return String(v);
}

function buildFormPDF(dados){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4', compress:true });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 52, larg = W - 2*M;
  const INK=[44,43,40], SOFT=[122,119,110], BORDER=[226,219,201], OK=[82,120,86], ERRO=[160,70,60];
  let y = 70;
  const novaPagina = h => { if(y + h > H - 50){ doc.addPage(); y = 60; } };
  const texto = (t,{tam=10,negrito=false,cor=INK,recuo=0,depois=4,italico=false}={}) => {
    doc.setFont('helvetica', negrito?(italico?'bolditalic':'bold'):(italico?'italic':'normal')); doc.setFontSize(tam); doc.setTextColor(...cor);
    doc.splitTextToSize(_limpo(t), larg-recuo).forEach(l => { novaPagina(tam+4); doc.text(l, M+recuo, y); y += tam+4; });
    y += depois;
  };
  const titulo = t => { y += 10; novaPagina(40); doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...INK);
    doc.text(_limpo(t).toUpperCase(), M, y); y += 6; doc.setDrawColor(...BORDER); doc.line(M, y, W-M, y); y += 16; };

  // Cabeçalho igual ao do DISC
  try { doc.addImage(LOGO_PDF_B64, 'PNG', M, y - 26, 28, 36); } catch(e) {}
  doc.setFont('times','italic'); doc.setFontSize(20); doc.setTextColor(...INK); doc.text('La Vie Consultoria', M + 38, y);
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...SOFT); doc.text('FORMULÁRIO DO PROCESSO SELETIVO', M + 38, y + 14);
  doc.setDrawColor(...BORDER); doc.line(M, y + 26, W - M, y + 26); y += 50;

  const nome = _limpo(dados.nome || dados.name || 'Candidato');
  doc.setFont('times','italic'); let tam = 24; doc.setFontSize(tam);
  while(tam > 14 && doc.getTextWidth(nome) > larg){ tam -= 1; doc.setFontSize(tam); }
  doc.setTextColor(...INK); doc.text(nome, M, y); y += tam*0.75 + 4;
  if(dados.vaga_titulo) texto('Vaga: ' + dados.vaga_titulo, {cor:SOFT, depois:0});
  const quando = dados.created_at || dados._enviadoEm;
  if(quando && !isNaN(new Date(quando))) texto('Enviado em ' + new Date(quando).toLocaleString('pt-BR'), {cor:SOFT, depois:0});

  // Dados de contato e pretensão
  titulo('Dados do candidato');
  DADOS_TOPO.filter(k => k in dados && !['nome','name','vaga_titulo','created_at'].includes(k))
    .forEach(k => texto(_rotulo(k) + ': ' + _valor(k, dados[k]), {depois:0}));

  // Ciência das condições da vaga
  const cientes = Object.keys(dados).filter(k => /^ciente_/.test(k));
  if(cientes.length){ titulo('Condições da vaga'); cientes.forEach(k => texto(_rotulo(k) + ': ' + _valor(k, dados[k]), {depois:0})); }

  // Questionário técnico com acerto/erro
  if(Array.isArray(dados.technical_answers) && dados.technical_answers.length){
    const tot = dados.technical_answers.length, acertos = dados.technical_answers.filter(x => x && x.correta).length;
    titulo('Questionário técnico  ·  ' + (dados.technical_score != null ? dados.technical_score : acertos) + ' de ' + tot);
    dados.technical_answers.forEach((q,i) => {
      texto((i+1) + '. ' + (q.pergunta||''), {negrito:true, depois:1});
      texto('Resposta: ' + (q.escolhida||'Não respondida'), {recuo:14, depois:1});
      texto(q.correta ? 'Correta' : 'Incorreta', {recuo:14, cor: q.correta?OK:ERRO, negrito:true, tam:9, depois:8});
    });
  }

  // Blocos de perguntas abertas (perfil, avaliação técnica, triagem...)
  const blocos = Object.keys(dados).filter(k => Array.isArray(dados[k]) && k !== 'technical_answers' && !IGNORAR_FORM.includes(k));
  blocos.forEach(k => {
    titulo(_rotulo(k));
    dados[k].forEach((item,i) => {
      if(item && typeof item === 'object'){
        const p = item.pergunta || item.q || item.titulo || '';
        const r = item.resposta != null ? item.resposta : (item.escolhida != null ? item.escolhida : item.r);
        if(p) texto((i+1) + '. ' + p, {negrito:true, depois:1});
        if(r !== undefined) texto(_valor('', r), {recuo:14, depois:8});
        Object.entries(item).filter(([kk]) => !['pergunta','q','titulo','resposta','escolhida','r','id'].includes(kk))
          .forEach(([kk,vv]) => texto(_rotulo(kk) + ': ' + (typeof vv==='object' ? JSON.stringify(vv) : _valor(kk,vv)), {recuo:14, cor:SOFT, depois:2}));
      } else texto('• ' + _valor('', item), {depois:2});
    });
  });

  // Qualquer outro campo que o formulário tenha mandado
  const resto = Object.keys(dados).filter(k => !DADOS_TOPO.includes(k) && !/^ciente_/.test(k) && !Array.isArray(dados[k])
    && !IGNORAR_FORM.includes(k) && k !== 'technical_score');
  if(resto.length){
    titulo('Outras informações');
    resto.forEach(k => { const v = dados[k]; texto(_rotulo(k) + ': ' + (v && typeof v==='object' ? JSON.stringify(v) : _valor(k,v)), {depois:2}); });
  }

  const pags = doc.getNumberOfPages();
  for(let i=1;i<=pags;i++){ doc.setPage(i); doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(180,175,168);
    doc.text('La Vie Consultoria · Documento de uso interno do processo seletivo · página ' + i + ' de ' + pags, M, H - 20); }
  return doc;
}

// Normaliza o DISC salvo em formatos antigos (most/primary_profile).
function _discNormalizado(d){
  const r = Object.assign({}, d);
  r.scores = r.scores || r.most;
  r.primary = r.primary || r.primary_profile;
  r.secondary = r.secondary || r.secondary_profile;
  r.name = r.name || r.nome || 'Candidato';
  return r;
}
window.lvPdfResultado = function(tipo, dados, enviadoEm){
  if(!window.jspdf) throw new Error('biblioteca de PDF não carregou');
  const d = Object.assign({}, dados || {}, { _enviadoEm: enviadoEm || null });
  if(tipo === 'disc'){
    const r = _discNormalizado(d);
    if(r.scores && PROFILES[r.primary] && DIM[r.secondary]) return buildPDF(r, false).output('blob');
  }
  return buildFormPDF(d).output('blob');
};
})();
