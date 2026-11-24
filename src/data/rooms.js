// Plans are drawn from these dimensions (metres), so the drawing and the stated area agree.
export const rooms = [
  {
    slug: 'basket-loft', name: 'Basket Loft', sleeps: 2, rate: 165, floor: 'Top floor', bath: true,
    facing: 'east', w: 6.4, d: 4.6,
    line: 'Under the roof where willow was dried, with a bath facing the sunrise.',
    detail: 'The drying racks are still in the rafters. The bed sits below the east gable, so the first light over the moor lands on it before anything else.',
    features: ['Freestanding bath', 'Sloping ceiling, 1.9 m at the bed', 'Quietest room'],
    fit: [['bed', 0.4, 0.5, 1.8, 2.0], ['bath', 4.4, 0.5, 1.6, 0.75], ['shower', 5.3, 3.4, 0.9, 0.9], ['desk', 2.8, 3.8, 1.4, 0.6], ['chair', 2.9, 1.2, 0.8, 0.8]],
    windows: [['e', 1.2, 2.2]],
  },
  {
    slug: 'the-eel-room', name: 'The Eel Room', sleeps: 2, rate: 145, floor: 'Ground floor', bath: false,
    facing: 'south', w: 5.2, d: 4.2,
    line: 'A door of your own onto the rhyne, with a bench for wet boots.',
    detail: 'Level access from the car and to the water. A rhyne is a drainage ditch and rhymes with seen; this one has kingfishers.',
    features: ['Step-free, wide doors', 'Own terrace', 'Dogs welcome'],
    fit: [['bed', 0.4, 0.4, 1.8, 2.0], ['shower', 4.1, 0.2, 0.9, 1.4], ['chair', 3.0, 2.7, 0.8, 0.8], ['bench', 0.5, 3.6, 1.6, 0.4]],
    windows: [['s', 2.4, 2.0]],
  },
  {
    slug: 'abbots-reach', name: 'Abbot’s Reach', sleeps: 4, rate: 240, floor: 'First floor', bath: true,
    facing: 'west', w: 8.2, d: 5.4,
    line: 'Two rooms facing the sunset and, in winter, the starlings.',
    detail: 'The big west window looks straight at the reedbed roost. From November to February you can watch the murmuration without getting out of the bath.',
    features: ['Separate bunk room', 'West window, 2.6 m wide', 'Freestanding bath'],
    fit: [['bed', 0.5, 0.5, 1.8, 2.0], ['bath', 3.0, 0.5, 1.7, 0.8], ['bunks', 6.4, 0.5, 0.9, 2.0], ['sofa', 1.0, 4.0, 2.0, 0.9], ['shower', 5.0, 4.2, 0.9, 0.9]],
    windows: [['w', 1.2, 2.6]], walls: [[5.9, 0, 5.9, 3.4]],
  },
  {
    slug: 'withy-boiler', name: 'The Boiler House', sleeps: 2, rate: 195, floor: 'In the yard', bath: true,
    facing: 'south', w: 7.0, d: 4.0,
    line: 'The brick house where willow was boiled buff, now with its own stove.',
    detail: 'A building to yourselves across the yard. The boiling tank is the bath, cut down and lined; it takes 25 minutes to fill and is worth it.',
    features: ['Detached', 'Wood stove', 'Bath for two in the old tank'],
    fit: [['bed', 0.4, 0.8, 1.8, 2.0], ['stove', 3.2, 0.2, 0.6, 0.6], ['bath', 4.7, 0.6, 1.9, 1.1], ['sofa', 2.9, 2.8, 1.8, 0.9], ['shower', 5.9, 2.9, 0.9, 0.9]],
    windows: [['s', 1.0, 1.4], ['s', 4.6, 1.4]],
  },
  {
    slug: 'peat-cutters', name: 'Peat Cutter’s', sleeps: 1, rate: 98, floor: 'First floor', bath: false,
    facing: 'north', w: 3.6, d: 3.4,
    line: 'A small room for one, with a proper desk and the whole north sky.',
    detail: 'Built for people who come to write or to look at stars. The blind comes down through the skylight on a pulley.',
    features: ['Writing desk', 'Skylight over the bed', 'Shower room'],
    fit: [['bed', 0.2, 0.3, 1.2, 2.0], ['desk', 2.2, 0.2, 1.2, 0.6], ['shower', 2.6, 2.4, 0.9, 0.9]],
    windows: [['n', 2.1, 1.2]],
  },
  {
    slug: 'flood-mark', name: 'Flood Mark', sleeps: 3, rate: 185, floor: 'First floor', bath: true,
    facing: 'south', w: 6.6, d: 5.0,
    line: 'Named for the line on the stair wall where the water stopped.',
    detail: 'A corner room with a daybed in the bay. The flood line is brass-pinned at 1.42 m in the hall below, and the hotel was rewired above it.',
    features: ['Daybed for a third guest', 'South bay', 'Bath and shower'],
    fit: [['bed', 0.4, 0.5, 1.8, 2.0], ['daybed', 2.6, 4.0, 1.9, 0.8], ['bath', 4.6, 0.4, 1.6, 0.75], ['shower', 5.4, 3.7, 0.9, 0.9], ['chair', 3.2, 1.4, 0.8, 0.8]],
    windows: [['s', 2.3, 2.6], ['e', 1.6, 1.2]],
  },
]

export const area = (r) => Math.round(r.w * r.d)
export const bySlug = (slug) => rooms.find((r) => r.slug === slug)
