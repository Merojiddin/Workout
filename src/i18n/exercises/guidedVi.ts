/**
 * Vietnamese wording for the guided workouts, keyed by the exact English text.
 *
 * Guided workouts carry plain English strings in their data files so a new
 * session can be written without touching a message catalog (see
 * `guidedWorkouts.ts`). They are translated the same way the exercise library
 * is: by exact phrase, with anything unrecognised passing through as written.
 * That is what lets a workout added later still render, in English, until its
 * wording is added here.
 *
 * As in [[vi.ts]], a movement keeps the English term in brackets where that is
 * what a gym in Vietnam actually says.
 */
export const guidedPhrasesVi: Record<string, string> = {
  // ------------------------------------------------------------- categories
  'Cardio / HIIT': 'Cardio / HIIT',
  'Short bursts of work with timed rest. Gets the heart rate up fast.':
    'Tập dồn dập từng đợt ngắn, xen kẽ nghỉ có tính giờ. Đẩy nhịp tim lên rất nhanh.',
  Abs: 'Cơ bụng',
  'Core circuits held for time, floor-based and equipment free.':
    'Chuỗi bài cơ trung tâm tính theo thời gian, tập dưới sàn và không cần dụng cụ.',
  'Posture Correction': 'Chỉnh tư thế',
  'Undo a day at a desk: upper back, neck and hip position.':
    'Gỡ lại một ngày ngồi bàn: lưng trên, cổ và tư thế hông.',
  'Mobility / Stretching': 'Vận động / Giãn cơ',
  'Longer holds for range of motion, warm-ups and cool-downs.':
    'Giữ lâu hơn để tăng biên độ, dùng để khởi động và thả lỏng.',

  // --------------------------------------------------------------- workouts
  'Classic HIIT': 'HIIT cơ bản',
  'The standard thirty-on, ten-off circuit through five bodyweight movements.':
    'Chuỗi ba mươi giây tập, mười giây nghỉ qua năm động tác không dụng cụ.',
  'Express Burner': 'Đốt mỡ cấp tốc',
  'Eight hard minutes when that is all the time there is.':
    'Tám phút nặng đô khi bạn chỉ có chừng đó thời gian.',
  'No-Jump Cardio': 'Cardio không nhảy',
  'The same work with one foot always on the floor - easy on knees and on neighbours.':
    'Cường độ tương đương nhưng luôn có một chân chạm sàn - nhẹ cho đầu gối và cho hàng xóm.',
  'First Cardio Session': 'Buổi cardio đầu tiên',
  'Six minutes, generous rest, nothing that needs coordination.':
    'Sáu phút, nghỉ thoải mái, không có động tác nào đòi hỏi phối hợp phức tạp.',
  'Core Basics': 'Cơ bụng căn bản',
  'Four movements that teach the shape everything else needs.':
    'Bốn động tác dạy bạn tư thế mà mọi bài còn lại đều cần.',
  'Ab Burner': 'Đốt cơ bụng',
  'Six movements, three rounds, ten seconds between each.':
    'Sáu động tác, ba vòng, nghỉ mười giây giữa mỗi động tác.',
  'Plank Challenge': 'Thử thách Plank',
  'Every plank there is, held back to back.':
    'Tất cả các kiểu plank, giữ liên tiếp nhau.',
  'Standing Abs': 'Cơ bụng đứng',
  'Core work with no floor needed - good for a hotel room or an office.':
    'Tập cơ trung tâm mà không cần nằm sàn - hợp với phòng khách sạn hoặc văn phòng.',
  'Desk Reset': 'Giải toả sau bàn làm việc',
  'Six minutes to undo a morning hunched over a laptop.':
    'Sáu phút để gỡ lại một buổi sáng gù lưng trước máy tính.',
  'Upper Back Strength': 'Khoẻ lưng trên',
  'The pulling and lifting work that holds a straight posture up once it is stretched.':
    'Các bài kéo và nâng giúp giữ tư thế thẳng sau khi đã giãn cơ.',
  'Posture Foundation': 'Nền tảng tư thế',
  'Rib position, hip position, and holding both while you move.':
    'Vị trí lồng ngực, vị trí hông, và giữ được cả hai khi chuyển động.',
  'Full Body Stretch': 'Giãn cơ toàn thân',
  'Head to heel, forty-five seconds a hold, one time through.':
    'Từ đầu tới gót, mỗi tư thế giữ bốn mươi lăm giây, chạy một lượt.',
  'Morning Mobility': 'Vận động buổi sáng',
  'Moving stretches to start the day, nothing held for long.':
    'Các động tác giãn cơ động để mở đầu ngày mới, không giữ lâu ở tư thế nào.',
  'Hips And Lower Back': 'Hông và lưng dưới',
  'For hips that have been folded into a chair all day.':
    'Dành cho phần hông đã gập trong ghế suốt cả ngày.',
  'Wind Down': 'Thả lỏng',
  'Five easy floor holds to finish a session or a day.':
    'Năm tư thế nằm sàn nhẹ nhàng để kết thúc buổi tập hoặc một ngày.',

  // ------------------------------------------------------------ focus tags
  Conditioning: 'Thể lực',
  'Cool-down': 'Thả lỏng',
  Core: 'Cơ trung tâm',
  Endurance: 'Sức bền',
  'Fat loss': 'Giảm mỡ',
  Flexibility: 'Độ dẻo',
  'Full body': 'Toàn thân',
  Hips: 'Hông',
  Isometric: 'Giữ tĩnh',
  'Low impact': 'Ít va chạm',
  'Lower back': 'Lưng dưới',
  Neck: 'Cổ',
  'No floor': 'Không cần nằm sàn',
  Relaxation: 'Thư giãn',
  Shoulders: 'Vai',
  Starter: 'Khởi đầu',
  Technique: 'Kỹ thuật',
  'Upper back': 'Lưng trên',
  'Warm-up': 'Khởi động',

  // --------------------------------------------------------- movement names
  //
  // Movements the strength library already names - Plank, Side Plank, Dead Bug,
  // Reverse Crunch, Lying Leg Raise, Chin Tuck - are deliberately absent: they
  // are translated once in `vi.ts`, which is merged ahead of this map.
  'Jumping Jacks': 'Nhảy dang tay chân (Jumping Jack)',
  'High Knees': 'Chạy nâng cao đùi',
  'Mountain Climbers': 'Leo núi tại chỗ (Mountain Climber)',
  Burpees: 'Burpee',
  'Slow Burpees': 'Burpee chậm',
  'Squat Jumps': 'Squat bật nhảy',
  'Skater Hops': 'Bật ngang kiểu trượt băng',
  'Plank Jacks': 'Plank bật tách chân',
  'Jump Rope': 'Nhảy dây',
  'Criss-Cross Jacks': 'Nhảy bắt chéo tay chân',
  'Step Jacks': 'Bước dang tay chân (không nhảy)',
  'Marching On The Spot': 'Giậm chân tại chỗ',
  'Alternating Ankle Touches': 'Nghiêng người chạm cổ chân luân phiên',
  'Front Kicks': 'Đá thẳng trước',
  'Wall Sit': 'Tựa tường giữ tư thế ngồi',
  'Bodyweight Squats': 'Squat không tạ',
  'Lunge With Twist': 'Lunge kết hợp xoay người',
  Crunch: 'Gập bụng (Crunch)',
  'Bicycle Crunch': 'Gập bụng đạp xe',
  'Flutter Kicks': 'Đạp chân luân phiên',
  'Russian Twist': 'Xoay người kiểu Nga (Russian Twist)',
  'Hollow Hold': 'Giữ tư thế lòng thuyền (Hollow Hold)',
  'Heel Touches': 'Chạm gót',
  'Oblique Crunch': 'Gập bụng chéo',
  'Plank Hip Raise': 'Plank đẩy hông lên',
  'Reverse Plank': 'Plank ngửa',
  'Standing Torso Rotation': 'Đứng xoay thân',
  'Bird Dog': 'Bird Dog',
  Superman: 'Superman',
  'Prone W Raise': 'Nằm sấp nâng tay chữ W',
  'Band Reverse Fly': 'Kéo dây tách tay ra sau',
  'Face Pull': 'Kéo dây về phía mặt (Face Pull)',
  'Wall Shoulder Walks': 'Đi tay lên tường',
  'Wall Push-Up': 'Chống đẩy vào tường',
  'Bodyweight Good Morning': 'Gập hông kiểu Good Morning không tạ',
  'Back Slaps And Wrap': 'Vung tay mở ngực và ôm vai',
  'Elbows Back Stretch': 'Giãn ngực bằng cách kéo khuỷu tay ra sau',
  'Standing Reach And Rotate': 'Đứng vươn tay và xoay lưng trên',
  'Overhead Chest Stretch': 'Giãn ngực với tay sau đầu',
  'Cat-Cow': 'Tư thế mèo - bò (Cat-Cow)',
  'Cobra Stretch': 'Giãn lưng tư thế rắn hổ mang',
  'Downward Dog': 'Tư thế chó úp mặt',
  'Low Lunge': 'Lunge thấp',
  'Deep Lunge Stretch': 'Giãn hông tư thế lunge sâu',
  'Kneeling Hip Flexor Stretch': 'Quỳ giãn cơ gấp hông',
  'Butterfly Stretch': 'Giãn háng tư thế con bướm',
  'Lying Hamstring Stretch': 'Nằm giãn cơ đùi sau',
  'Standing Hamstring Stretch': 'Đứng giãn cơ đùi sau',
  'Standing Quad Stretch': 'Đứng giãn cơ đùi trước',
  'Seated Calf Stretch': 'Ngồi giãn bắp chân',
  'Kneeling Lat Stretch': 'Quỳ giãn cơ lưng xô',
  'Cross-Body Shoulder Stretch': 'Giãn vai bằng cách kéo tay ngang ngực',
  'Side Neck Stretch': 'Giãn cơ cổ sang bên',
  'Dynamic Chest Stretch': 'Giãn ngực động',
  'Dynamic Back Stretch': 'Giãn lưng động',

  // -------------------------------------------------------- coaching lines
  'Land soft, arms all the way overhead.':
    'Tiếp đất nhẹ, tay vung hết lên trên đầu.',
  'Knees to hip height, stay on the balls of your feet.':
    'Nâng gối ngang hông, luôn tiếp đất bằng nửa bàn chân trước.',
  'Hips low, shoulders stacked over your hands.':
    'Hông thấp, vai thẳng hàng trên bàn tay.',
  'Chest to the floor, then jump and reach.':
    'Ngực chạm sàn, rồi bật lên và vươn tay.',
  'Same shape as a burpee, walked instead of jumped.':
    'Cùng động tác như burpee nhưng bước chân thay vì bật nhảy.',
  'Sit back, explode up, land quietly.':
    'Hạ hông ra sau, bật lên dứt khoát, tiếp đất êm.',
  'Bound side to side and stick each landing.':
    'Bật ngang qua lại và giữ vững mỗi lần tiếp đất.',
  'Plank on top, jumping feet underneath.':
    'Giữ plank ở phần trên, chỉ có chân bật ra vào.',
  'Small hops, wrists doing the turning.':
    'Bật nhẹ, quay dây bằng cổ tay.',
  'Cross the arms and feet, then open wide.':
    'Bắt chéo tay và chân, rồi mở rộng ra.',
  'A jumping jack with one foot always down.':
    'Như jumping jack nhưng luôn có một chân chạm đất.',
  'Tall posture, knees up, arms swinging.':
    'Lưng thẳng, nâng gối, tay đánh nhịp nhàng.',
  'Hinge side to side and reach for the ankle.':
    'Nghiêng người sang hai bên và với xuống cổ chân.',
  'Kick from the hip, guard up.': 'Đá ra từ hông, tay giữ ở tư thế phòng thủ.',
  'Thighs parallel, back flat against the wall.':
    'Đùi song song mặt sàn, lưng áp phẳng vào tường.',
  'Sit back between your heels, chest tall.':
    'Hạ hông xuống giữa hai gót, ngực vẫn ngẩng cao.',
  'Long step, then rotate over the front leg.':
    'Bước dài, rồi xoay người về phía chân trước.',
  'Ribs towards hips - the lower back stays down.':
    'Kéo lồng ngực về phía hông - lưng dưới luôn áp sàn.',
  'Opposite elbow towards opposite knee, slowly.':
    'Khuỷu tay bên này hướng về gối bên kia, làm chậm.',
  'Roll the hips up, do not swing the legs.':
    'Cuộn hông lên, đừng lấy đà bằng chân.',
  'One straight line from your head to your heels.':
    'Một đường thẳng từ đầu tới gót chân.',
  'Hips high, shoulder stacked over the elbow.':
    'Hông nâng cao, vai thẳng hàng trên khuỷu tay.',
  'Lower only as far as your back stays flat.':
    'Chỉ hạ chân tới mức lưng còn áp sàn.',
  'Small, fast kicks with the lower back pinned down.':
    'Đạp chân ngắn và nhanh, lưng dưới luôn ghim xuống sàn.',
  'Rotate from the ribs, chest stays lifted.':
    'Xoay từ lồng ngực, ngực vẫn mở.',
  'Lower back glued to the floor throughout.':
    'Lưng dưới dán chặt xuống sàn suốt bài.',
  'Press the lower back down and hold the dish shape.':
    'Ép lưng dưới xuống và giữ hình lòng thuyền.',
  'Crunch to the side and tap your heel.':
    'Gập người sang bên và chạm gót chân.',
  'Drive the elbow towards the opposite hip.':
    'Đẩy khuỷu tay về phía hông bên đối diện.',
  'From a forearm plank, pike the hips up and back.':
    'Từ tư thế plank khuỷu tay, đẩy hông lên và ra sau.',
  'Chest open, hips lifted, eyes forward.':
    'Mở ngực, nâng hông, mắt nhìn thẳng.',
  'Turn from the waist, hips facing forward.':
    'Xoay từ eo, hông vẫn hướng về trước.',
  'Opposite arm and leg, no wobble through the hips.':
    'Tay và chân đối diện, hông không lắc.',
  'Lift the chest and thighs, look at the floor.':
    'Nâng ngực và đùi lên, mắt nhìn xuống sàn.',
  'Pull the shoulder blades down and together.':
    'Kéo hai bả vai xuống và ép lại gần nhau.',
  'Open the arms wide, thumbs leading.':
    'Mở rộng hai tay, ngón cái dẫn hướng.',
  'Pull to your forehead, elbows high.':
    'Kéo về phía trán, khuỷu tay giữ cao.',
  'Ribs down - do not arch to reach higher.':
    'Hạ lồng ngực xuống - đừng ưỡn lưng để với cao hơn.',
  'Push the floor away and let the shoulder blades spread.':
    'Đẩy mạnh vào tường và để hai bả vai giãn ra.',
  'Hinge at the hips with a flat back.': 'Gập ở khớp hông, lưng giữ phẳng.',
  'Slide the head back over your shoulders.':
    'Đẩy đầu lùi lại cho thẳng hàng với vai.',
  'Swing the arms open, then wrap them around you.':
    'Vung hai tay mở rộng, rồi ôm vòng quanh người.',
  'Chest open, shoulders rolling back and down.':
    'Mở ngực, vai xoay ra sau và xuống dưới.',
  'Reach tall, then turn and open the chest.':
    'Vươn cao, rồi xoay người và mở ngực.',
  'Hands behind the head, elbows back.':
    'Hai tay sau đầu, khuỷu tay kéo ra sau.',
  'Round on the way out, arch on the way in.':
    'Cong lưng lên khi thở ra, võng lưng xuống khi hít vào.',
  'Long through the front, shoulders away from your ears.':
    'Kéo dài phần thân trước, vai hạ xa khỏi tai.',
  'Hips high, heels reaching for the floor.':
    'Hông đẩy cao, gót chân với xuống sàn.',
  'Sink the hips forward and stay tall.':
    'Đẩy hông về trước và giữ thân người thẳng.',
  'Drop the hips and let the chest stay lifted.':
    'Hạ hông xuống và giữ ngực ngẩng cao.',
  'Tuck the tailbone under before you lean.':
    'Cuộn xương cụt xuống trước khi đẩy người tới.',
  'Soles together, chest tall, knees easing down.':
    'Hai lòng bàn chân áp nhau, ngực thẳng, gối từ từ hạ xuống.',
  'Straight leg up, the other one pressed down.':
    'Một chân duỗi thẳng đưa lên, chân kia ép sát sàn.',
  'Hinge from the hips, back stays long.':
    'Gập từ khớp hông, lưng giữ dài và thẳng.',
  'Knees together, hips tucked under.':
    'Hai gối sát nhau, hông cuộn xuống dưới.',
  'Pull the toes towards you, knee straight.':
    'Kéo mũi bàn chân về phía mình, gối duỗi thẳng.',
  'Hips back, armpits sinking towards the floor.':
    'Hông đẩy ra sau, nách hạ dần xuống sàn.',
  'Arm across the chest, shoulder pulled down.':
    'Tay vắt ngang ngực, vai kéo xuống.',
  'Ear towards the shoulder, no shrugging.':
    'Nghiêng tai về phía vai, không nhún vai lên.',
  'Open the arms wide and pulse gently.':
    'Mở rộng hai tay và nhịp nhẹ nhàng.',
  'Round forward, then open wide.':
    'Cuộn người về trước, rồi mở rộng ra.',

  // ------------------------------------------------------ spoken mid-cues
  'Arms all the way up. Stay light on your feet.':
    'Tay vươn hết lên. Chân giữ nhẹ nhàng.',
  'Higher knees. Drive the arms.': 'Nâng gối cao hơn. Đánh tay mạnh lên.',
  'Keep the hips down. Quick feet.': 'Giữ hông thấp. Chân đảo nhanh.',
  'Pace it. Full stand at the top of every rep.':
    'Giữ nhịp đều. Mỗi lần đều đứng thẳng hẳn lên.',
  'Soft landings. Knees tracking over your toes.':
    'Tiếp đất êm. Gối hướng theo mũi chân.',
  'Keep breathing. Weight in your heels.': 'Thở đều. Dồn trọng lượng vào gót.',
  'Chin off your chest. Squeeze at the top.':
    'Cằm không ép vào ngực. Siết bụng ở điểm cao nhất.',
  'Hips level. Keep breathing.': 'Giữ hông ngang bằng. Thở đều.',
  'Press your lower back into the floor.': 'Ép lưng dưới xuống sàn.',
  'Slow it down. Keep your hips square to the floor.':
    'Làm chậm lại. Giữ hông vuông góc với sàn.',
  'Tuck your tailbone. Do not arch your lower back.':
    'Cuộn xương cụt xuống. Đừng ưỡn lưng dưới.',

  // --------------------------------------------------------- how-to lines
  'Jump the feet wide and sweep both arms above your head.':
    'Bật hai chân rộng ra và vung cả hai tay lên quá đầu.',
  'Jump them back together and keep a steady, springy rhythm.':
    'Bật khép chân lại và giữ nhịp nảy đều đặn.',
  'Drive one knee up to hip height, then quickly swap.':
    'Nâng một gối lên ngang hông, rồi đổi chân thật nhanh.',
  'Stay tall, pump the arms, and keep the contact with the floor short.':
    'Giữ thân người thẳng, đánh tay, và chạm sàn thật ngắn.',
  'Start in a push-up position with your hands under your shoulders.':
    'Bắt đầu ở tư thế chống đẩy, hai tay đặt dưới vai.',
  'Drive the knees to your chest one at a time without letting the hips rise.':
    'Kéo lần lượt từng gối về phía ngực mà không để hông nhô lên.',
  'Squat down, plant your hands, and shoot the feet back to a plank.':
    'Hạ người xuống squat, chống hai tay, rồi đạp chân ra sau thành plank.',
  'Jump the feet back in, stand, and finish with a jump and a reach overhead.':
    'Bật chân về, đứng lên, và kết thúc bằng một cú bật nhảy vươn tay lên cao.',
  'Squat down, plant the hands, and step the feet back one at a time.':
    'Hạ người xuống squat, chống hai tay, rồi bước từng chân ra sau.',
  'Step them back in and stand tall - no jump at either end.':
    'Bước từng chân về và đứng thẳng lên - không bật nhảy ở cả hai đầu.',
  'Drop into a squat with your chest up and your weight through mid-foot.':
    'Hạ xuống squat với ngực ngẩng và trọng lượng dồn vào giữa bàn chân.',
  'Drive up into a jump and absorb the landing straight back into the next squat.':
    'Bật mạnh lên và hạ xuống êm, tiếp luôn vào lần squat kế tiếp.',
  'Push off one leg and bound sideways onto the other.':
    'Đạp một chân và bật ngang sang chân kia.',
  'Let the trailing leg swing behind you and hold the landing for a beat.':
    'Để chân sau vắt chéo ra phía sau và giữ vững tư thế một nhịp.',
  'Hold a strong plank with your shoulders over your hands.':
    'Giữ plank chắc chắn với vai thẳng hàng trên bàn tay.',
  'Jump the feet wide and back together without letting the hips bounce.':
    'Bật hai chân rộng ra rồi khép lại mà không để hông nhấp nhô.',
  'Turn the rope from the wrists, elbows tucked in near your ribs.':
    'Quay dây bằng cổ tay, khuỷu tay khép sát sườn.',
  'Keep the jumps low - just enough to clear the rope.':
    'Bật thấp thôi - vừa đủ để dây đi qua.',
  'Jump the feet apart and swing the arms out to the sides.':
    'Bật tách hai chân và vung hai tay sang ngang.',
  'Jump them back crossing one foot and one arm over the other, alternating each rep.':
    'Bật về khép lại, bắt chéo một chân và một tay, đổi bên mỗi lần.',
  'Step one foot out to the side and sweep both arms overhead.':
    'Bước một chân sang bên và vung cả hai tay lên quá đầu.',
  'Step it back in and repeat on the other side, keeping the rhythm going.':
    'Bước chân về và lặp lại với bên kia, giữ nhịp liên tục.',
  'March on the spot lifting each knee to hip height.':
    'Giậm chân tại chỗ, nâng từng gối lên ngang hông.',
  'Swing the opposite arm with every step and breathe steadily.':
    'Đánh tay đối diện theo mỗi bước và thở đều.',
  'Stand with your feet wide and bend to one side, reaching for that ankle.':
    'Đứng hai chân rộng, nghiêng sang một bên và với xuống cổ chân bên đó.',
  'Come back up and repeat on the other side at a steady pace.':
    'Đứng thẳng lên và lặp lại với bên kia theo nhịp đều.',
  'Keep your hands up and drive one foot forward at hip height.':
    'Giữ hai tay lên cao và đá một chân ra trước ngang hông.',
  'Bring it straight back under you and swap sides.':
    'Thu chân về ngay dưới thân người rồi đổi bên.',
  'Slide down a wall until your knees are bent to a right angle.':
    'Trượt lưng xuống dọc tường tới khi gối gập vuông góc.',
  'Press your lower back into the wall and breathe - nothing moves.':
    'Ép lưng dưới vào tường và thở đều - không cử động gì thêm.',
  'Feet about shoulder width, toes turned slightly out.':
    'Hai chân rộng bằng vai, mũi chân hơi xoay ra ngoài.',
  'Sit back and down as far as you can hold a flat back, then stand and squeeze.':
    'Hạ hông xuống sâu nhất mà lưng còn giữ phẳng, rồi đứng lên và siết mông.',
  'Step forward into a lunge until both knees are bent to a right angle.':
    'Bước tới thành tư thế lunge cho tới khi cả hai gối gập vuông góc.',
  'Rotate your torso towards the front leg, come back to centre and push up.':
    'Xoay thân về phía chân trước, quay lại giữa rồi đạp lên.',
  'Lie on your back with your knees bent and your hands by your ears.':
    'Nằm ngửa, gối gập, hai tay đặt cạnh tai.',
  'Curl your shoulders off the floor, pause at the top, and lower with control.':
    'Cuộn vai lên khỏi sàn, dừng ở điểm cao nhất, rồi hạ xuống có kiểm soát.',
  'Lie back, lift both feet, and bring one knee in as the other leg extends.':
    'Nằm ngửa, nhấc hai chân lên, kéo một gối vào trong khi chân kia duỗi ra.',
  'Rotate your chest - not just your elbow - towards the bent knee, and alternate.':
    'Xoay cả phần ngực - không chỉ khuỷu tay - về phía gối đang co, rồi đổi bên.',
  'Lie on your back with your knees bent over your hips and arms by your sides.':
    'Nằm ngửa, gối gập ở phía trên hông, hai tay xuôi theo thân.',
  'Curl your hips off the floor towards your ribs, then lower slowly.':
    'Cuộn hông lên khỏi sàn về phía lồng ngực, rồi hạ xuống từ từ.',
  'Elbows under your shoulders, forearms flat on the floor.':
    'Khuỷu tay dưới vai, cẳng tay áp phẳng xuống sàn.',
  'Squeeze your glutes and abs so your hips neither sag nor pike up.':
    'Siết mông và bụng để hông không võng xuống cũng không nhô lên.',
  'Lie on your side and prop yourself on one forearm, feet stacked.':
    'Nằm nghiêng và chống lên một cẳng tay, hai bàn chân xếp chồng.',
  'Lift your hips until your body is a straight line and hold.':
    'Nâng hông lên tới khi thân người thành một đường thẳng rồi giữ.',
  'Lie flat with your hands under your hips and your legs straight.':
    'Nằm ngửa, hai tay đặt dưới hông, hai chân duỗi thẳng.',
  'Raise both legs to vertical, then lower them slowly without arching.':
    'Nâng hai chân lên vuông góc, rồi hạ xuống chậm mà không ưỡn lưng.',
  'Lie on your back with your legs straight and lifted just off the floor.':
    'Nằm ngửa, hai chân duỗi thẳng và nhấc nhẹ khỏi sàn.',
  'Kick them past each other in a short, quick scissor.':
    'Đạp hai chân qua nhau theo nhịp kéo ngắn và nhanh.',
  'Sit back at about forty-five degrees with your feet off the floor.':
    'Ngả người ra sau khoảng bốn mươi lăm độ, hai chân nhấc khỏi sàn.',
  'Rotate your torso from side to side, touching the floor beside each hip.':
    'Xoay thân qua lại, chạm sàn ở hai bên hông.',
  'Lie back with your arms up and your knees over your hips.':
    'Nằm ngửa, hai tay đưa lên và gối ở phía trên hông.',
  'Lower one arm and the opposite leg, breathe out, and return. Alternate sides.':
    'Hạ một tay và chân đối diện, thở ra, rồi thu về. Đổi bên luân phiên.',
  'Lie on your back and lift your shoulders, arms and legs off the floor.':
    'Nằm ngửa và nhấc vai, tay và chân lên khỏi sàn.',
  'Keep the lower back pressed flat - drop the legs higher if it lifts.':
    'Giữ lưng dưới ép phẳng - nếu lưng bị nhấc lên thì hạ chân cao hơn.',
  'Lie on your back with your knees bent and heels close to your hips.':
    'Nằm ngửa, gối gập và gót chân gần sát hông.',
  'Lift your shoulders slightly and reach side to side to touch each heel.':
    'Nhấc nhẹ vai lên và với sang hai bên để chạm từng gót chân.',
  'Lie on your back with both knees dropped to one side.':
    'Nằm ngửa, thả cả hai gối sang một bên.',
  'Curl your shoulders up towards your top hip, then lower with control.':
    'Cuộn vai lên hướng về bên hông phía trên, rồi hạ xuống có kiểm soát.',
  'Hold a forearm plank with your feet about hip width apart.':
    'Giữ plank khuỷu tay với hai chân rộng bằng hông.',
  'Push the hips up towards the ceiling, then lower back to a flat plank.':
    'Đẩy hông lên phía trần nhà, rồi hạ về tư thế plank phẳng.',
  'Sit with your legs straight and your hands on the floor behind your hips.':
    'Ngồi duỗi thẳng chân, hai tay chống sàn phía sau hông.',
  'Press through your hands and heels to lift the hips into a straight line.':
    'Đạp qua tay và gót để nâng hông lên thành một đường thẳng.',
  'Stand tall with your arms bent in front of your chest.':
    'Đứng thẳng, hai tay gập trước ngực.',
  'Rotate your upper body left and right, keeping your hips still.':
    'Xoay phần thân trên sang trái và phải, giữ hông đứng yên.',
  'On all fours, hands under shoulders and knees under hips.':
    'Chống bốn điểm, tay dưới vai và gối dưới hông.',
  'Reach one arm forward and the opposite leg back, pause, and swap.':
    'Vươn một tay ra trước và chân đối diện ra sau, dừng lại rồi đổi bên.',
  'Lie face down with your arms reaching in front of you.':
    'Nằm sấp, hai tay vươn thẳng về phía trước.',
  'Lift your chest, arms and legs a few inches, hold a beat, and lower.':
    'Nhấc ngực, tay và chân lên vài phân, giữ một nhịp rồi hạ xuống.',
  'Lie face down with your elbows bent so your arms make a W.':
    'Nằm sấp, gập khuỷu tay để hai tay tạo thành chữ W.',
  'Lift your hands and chest slightly by squeezing between the shoulder blades.':
    'Nhấc nhẹ tay và ngực lên bằng cách siết giữa hai bả vai.',
  'Hold a band in front of you at chest height with straight arms.':
    'Cầm dây trước mặt ngang ngực với hai tay duỗi thẳng.',
  'Pull it apart until your arms are wide, squeeze, and return slowly.':
    'Kéo dây tách ra tới khi hai tay mở rộng, siết lại, rồi thu về từ từ.',
  'Hold a band at head height and pull it towards your face.':
    'Cầm dây ngang đầu và kéo về phía mặt.',
  'Finish with your hands beside your ears and your elbows above your wrists.':
    'Kết thúc với hai tay cạnh tai và khuỷu tay cao hơn cổ tay.',
  'Stand facing a wall and place both hands on it at chest height.':
    'Đứng đối diện tường và đặt hai tay lên tường ngang ngực.',
  'Walk your hands up the wall as far as you can without your ribs flaring, then back down.':
    'Đi tay lên tường cao nhất có thể mà lồng ngực không bị bung ra, rồi đi xuống.',
  'Stand an arm length from a wall with your hands at shoulder height.':
    'Đứng cách tường một tầm tay, hai tay đặt ngang vai.',
  'Bend your elbows to bring your chest to the wall, then press away.':
    'Gập khuỷu tay đưa ngực về phía tường, rồi đẩy ra.',
  'Stand with your hands behind your head and a soft bend in your knees.':
    'Đứng với hai tay sau đầu và gối hơi chùng.',
  'Push your hips back until you feel your hamstrings, then stand and squeeze your glutes.':
    'Đẩy hông ra sau tới khi cảm nhận cơ đùi sau, rồi đứng lên và siết mông.',
  'Sit or stand tall and look straight ahead.':
    'Ngồi hoặc đứng thẳng và nhìn thẳng về trước.',
  'Draw your chin straight back to make a double chin, hold, and release.':
    'Kéo cằm thẳng ra sau tạo thành cằm đôi, giữ rồi thả.',
  'Swing both arms wide open to stretch across the chest.':
    'Vung cả hai tay mở rộng để giãn ngang phần ngực.',
  'Wrap them around yourself to open up between the shoulder blades, and repeat.':
    'Ôm vòng hai tay quanh người để mở phần giữa hai bả vai, rồi lặp lại.',
  'Bring your hands behind your head with your elbows wide.':
    'Đưa hai tay ra sau đầu, khuỷu tay mở rộng.',
  'Draw the elbows back until you feel the chest open, and breathe there.':
    'Kéo khuỷu tay ra sau tới khi thấy ngực mở ra, và thở ở đó.',
  'Reach both arms overhead and lengthen through your side.':
    'Vươn cả hai tay lên quá đầu và kéo dài phần sườn.',
  'Open one arm behind you as you rotate the upper back, then swap sides.':
    'Mở một tay ra sau khi xoay lưng trên, rồi đổi bên.',
  'Lace your fingers behind your head and lift your chest.':
    'Đan các ngón tay sau đầu và nâng ngực lên.',
  'Ease the elbows back until the front of your shoulders opens, then hold.':
    'Từ từ kéo khuỷu tay ra sau tới khi phần trước vai mở ra, rồi giữ.',
  'Start on all fours with your hands under your shoulders.':
    'Bắt đầu ở tư thế chống bốn điểm với hai tay dưới vai.',
  'Round your back as you breathe out, then arch and lift your chest as you breathe in.':
    'Cong lưng lên khi thở ra, rồi võng lưng và nâng ngực khi hít vào.',
  'Lie face down with your hands under your shoulders.':
    'Nằm sấp với hai tay đặt dưới vai.',
  'Press up to lift your chest, keeping your hips on the floor.':
    'Chống tay nâng ngực lên, giữ hông áp sàn.',
  'From all fours, tuck your toes and lift your hips into an upside-down V.':
    'Từ tư thế chống bốn điểm, gập mũi chân và đẩy hông lên thành chữ V ngược.',
  'Press the floor away, lengthen your spine, and let the heels sink.':
    'Đẩy mạnh xuống sàn, kéo dài cột sống, và để gót chân hạ dần.',
  'Step one foot forward and lower the back knee to the floor.':
    'Bước một chân lên trước và hạ gối sau xuống sàn.',
  'Ease your hips forward until the front of the back hip opens, and hold.':
    'Từ từ đẩy hông về trước tới khi phần trước hông sau mở ra, rồi giữ.',
  'Take a long step forward and sink into a deep lunge.':
    'Bước một bước dài về trước và hạ sâu vào tư thế lunge.',
  'Keep the back leg long and breathe into the front of that hip.':
    'Giữ chân sau duỗi dài và thở vào phần trước của hông đó.',
  'Kneel on one knee with the other foot planted in front.':
    'Quỳ một gối, bàn chân kia đặt vững phía trước.',
  'Squeeze the glute on the kneeling side and ease your hips forward.':
    'Siết cơ mông bên chân quỳ và từ từ đẩy hông về trước.',
  'Sit with the soles of your feet together and your heels near your hips.':
    'Ngồi với hai lòng bàn chân áp vào nhau và gót gần sát hông.',
  'Sit up tall and let your knees settle towards the floor.':
    'Ngồi thẳng lưng và để hai gối hạ dần xuống sàn.',
  'Lie on your back and raise one straight leg towards you.':
    'Nằm ngửa và nâng một chân duỗi thẳng về phía mình.',
  'Hold behind the thigh and keep the other leg flat on the floor.':
    'Giữ phía sau đùi và để chân còn lại áp phẳng xuống sàn.',
  'Put one heel in front of you with that leg straight and toes up.':
    'Đặt một gót chân ra trước, chân duỗi thẳng và mũi chân hướng lên.',
  'Push your hips back and hinge forward until the hamstring pulls.':
    'Đẩy hông ra sau và gập người tới khi cơ đùi sau căng ra.',
  'Hold one ankle behind you and bring the knees level.':
    'Giữ một cổ chân ra sau và đưa hai gối ngang nhau.',
  'Tuck your hips under until the front of the thigh stretches.':
    'Cuộn hông xuống dưới tới khi phần trước đùi được giãn.',
  'Sit with one leg straight out in front of you.':
    'Ngồi với một chân duỗi thẳng ra trước.',
  'Reach for the foot and draw the toes back towards your shin.':
    'Với tới bàn chân và kéo mũi chân về phía ống chân.',
  'Kneel and place both hands on the floor in front of you.':
    'Quỳ xuống và đặt hai tay lên sàn phía trước.',
  'Sit your hips back and let your chest sink between your arms.':
    'Hạ hông ra sau và để ngực chìm xuống giữa hai tay.',
  'Bring one straight arm across your chest.':
    'Đưa một tay duỗi thẳng vắt ngang ngực.',
  'Hook it with the other arm and draw it in, keeping the shoulder down.':
    'Dùng tay kia móc lại và kéo vào, giữ vai hạ xuống.',
  'Sit or stand tall and tilt one ear towards that shoulder.':
    'Ngồi hoặc đứng thẳng và nghiêng một bên tai về phía vai bên đó.',
  'Let the opposite shoulder stay heavy and breathe into the stretch.':
    'Để vai bên kia thả nặng xuống và thở vào phần đang giãn.',
  'Bring both arms out to the sides at shoulder height.':
    'Đưa cả hai tay sang ngang ở độ cao ngang vai.',
  'Draw them back to open the chest, then release, in a steady rhythm.':
    'Kéo tay ra sau để mở ngực, rồi thả ra, theo một nhịp đều.',
  'Reach both arms forward and round your upper back.':
    'Vươn cả hai tay về trước và cuộn tròn lưng trên.',
  'Open the arms wide and lift the chest, then repeat at an easy pace.':
    'Mở rộng hai tay và nâng ngực lên, rồi lặp lại với nhịp thong thả.',

  // ------------------------------------------- the hard end of the catalog
  //
  // Added alongside the plyometric, gymnastic and loaded-conditioning
  // movements. Same rules as above: keyed by the exact English text, and the
  // English term stays in brackets where a gym in Vietnam actually says it.
  "A burpee that lands in a full squat every rep.":
    "Burpee mà mỗi lần đều tiếp xuống thành squat sâu.",
  "Ab Wheel Rollout": "Lăn bánh xe tập bụng",
  "All out. Nothing held back.": "Dốc toàn lực. Không giữ lại gì.",
  "All the way up, all the way down.": "Lên hết cỡ, xuống hết cỡ.",
  "Archer Pull-Ups": "Hít xà cung thủ",
  "Archer Push-Ups": "Chống đẩy cung thủ",
  "Arms and legs both driving. All out.": "Tay và chân cùng đạp. Dốc toàn lực.",
  "Assault Bike Sprint": "Đạp xe Assault nước rút",
  "At the top, rotate into a side plank and reach the top arm at the ceiling. Alternate sides.":
    "Ở trên đỉnh, xoay thành plank nghiêng và vươn tay trên lên trần. Đổi bên luân phiên.",
  "Back flat against the pad, hips curling up.":
    "Lưng áp phẳng vào đệm, hông cuộn lên.",
  "Balance on your seat, legs and chest lifted.":
    "Giữ thăng bằng trên mông, chân và ngực đều nâng.",
  "Ball Pull-Ins": "Kéo bóng vào bằng chân",
  "Band Lateral Walks": "Bước ngang với dây kháng lực",
  "Battle Ropes": "Dây thừng chiến (Battle Rope)",
  "Bell at the chest, sit straight down.": "Tạ ôm trước ngực, hạ thẳng người xuống.",
  "Bells racked, squat, punch overhead.": "Tạ đặt trên vai, squat, rồi đẩy thẳng lên.",
  "Bench Dips": "Chống đẩy ngược trên ghế",
  "Bend that knee while the other leg stays straight, then drive back to the middle.":
    "Gập gối bên đó trong khi chân kia giữ thẳng, rồi đạp về giữa.",
  "Bend the elbows to lower the crown of your head towards the floor, then press back up.":
    "Gập khuỷu tay để hạ đỉnh đầu xuống sàn, rồi đẩy lên.",
  "Bend the elbows to lower your hips, then press back up without locking out hard.":
    "Gập khuỷu tay để hạ hông xuống, rồi đẩy lên mà không khoá khớp quá mạnh.",
  "Bend the knees if the hips start to break. Never the lower back.":
    "Co gối lại nếu hông bắt đầu gãy nhịp. Tuyệt đối không gãy lưng dưới.",
  "Bodyweight Gauntlet": "Thử thách không dụng cụ",
  "Box Jumps": "Bật lên bục",
  "Box Pistol Squats": "Squat một chân xuống bục",
  "Bring both feet up to touch the bar, then lower under control.":
    "Đưa cả hai bàn chân lên chạm xà, rồi hạ xuống có kiểm soát.",
  "Burpee Gauntlet": "Thử thách Burpee",
  "Burpee With Side Kick": "Burpee kèm đá ngang",
  "Burpee, then kick out hard on the way up.": "Burpee, rồi đá mạnh ra khi đứng lên.",
  "Butterfly Pull-Ups": "Hít xà kiểu bướm (Butterfly)",
  "Captain's Chair Leg Raise": "Nâng chân trên ghế Captain's Chair",
  "Chest down, hands off the floor, press.": "Ngực chạm sàn, nhấc tay lên, rồi đẩy.",
  "Chest off the floor, then row the elbows back.":
    "Nhấc ngực khỏi sàn, rồi kéo khuỷu tay ra sau.",
  "Chest tall. Do not let the front knee cave in.":
    "Ngực ngẩng. Đừng để gối trước đổ vào trong.",
  "Chest up. Full depth on every landing.":
    "Ngực ngẩng cao. Tiếp đất sâu hết ở mỗi nhịp.",
  "Chop from high to low across the body.":
    "Bổ chéo từ trên cao xuống thấp qua thân người.",
  "Close-Grip Pull-Ups": "Hít xà tay hẹp",
  "Come down if the shoulders start to give. Do not fold.":
    "Hạ xuống nếu vai bắt đầu đuối. Đừng để gập người.",
  "Coordination": "Phối hợp",
  "Core Marathon": "Marathon cơ bụng",
  "Criss-Cross": "Gập bụng chéo luân phiên",
  "Criss-Cross Jumps": "Bật bắt chéo chân",
  "Crunch the top knee up to meet the top elbow, then extend. Swap sides halfway.":
    "Gập gối trên lên đón khuỷu tay trên, rồi duỗi ra. Đổi bên khi được nửa thời gian.",
  "Curl your shoulders up towards your hips, then lower slowly.":
    "Cuộn vai lên về phía hông, rồi hạ xuống từ từ.",
  "Curtsy Lunges": "Lunge chéo chân",
  "Decline Crunch": "Gập bụng ghế dốc xuống",
  "Dip the hips side to side without dropping them.":
    "Hạ hông qua lại hai bên mà không để rơi xuống sàn.",
  "Dive under, sweep up, reverse it.": "Chúi người xuống, lướt lên, rồi làm ngược lại.",
  "Do one push-up, then walk both hands and feet a step to the side.":
    "Chống đẩy một lần, rồi bò cả tay và chân sang ngang một bước.",
  "Double Unders": "Nhảy dây hai vòng",
  "Dragon Flag": "Dragon Flag",
  "Drive each knee out to the elbow on the same side and back, quickly.":
    "Kéo từng gối ra chạm khuỷu tay cùng bên rồi thu về, thật nhanh.",
  "Drive each knee up to hip height on the spot.":
    "Nâng từng gối lên ngang hông tại chỗ.",
  "Drive fast alternating waves down the rope without standing up.":
    "Tạo sóng nhanh luân phiên dọc dây mà không đứng thẳng lên.",
  "Drive one knee up and rotate the opposite elbow across to meet it.":
    "Nâng một gối lên và xoay khuỷu tay đối diện sang đón gối.",
  "Drive one knee up as you pull the arms down to meet it, then swap sides.":
    "Nâng một gối lên đồng thời kéo hai tay xuống đón gối, rồi đổi bên.",
  "Drive the hips and pull the bell up to chin height with the elbows leading.":
    "Đẩy hông và kéo tạ lên ngang cằm với khuỷu tay dẫn hướng.",
  "Drive the hips through and pull it straight overhead in one movement, then lower it under control.":
    "Đẩy hông qua và kéo tạ thẳng lên quá đầu trong một động tác, rồi hạ xuống có kiểm soát.",
  "Drive through the front heel straight into the next step forward.":
    "Đạp qua gót chân trước để bước thẳng vào nhịp kế tiếp.",
  "Drive up and let the momentum carry them straight overhead, then bring them back down into the next squat.":
    "Bật lên và để đà đưa tạ thẳng lên quá đầu, rồi hạ về vào lần squat kế tiếp.",
  "Drive up and reach both arms straight overhead, then go again without pausing.":
    "Bật lên và vươn thẳng hai tay quá đầu, rồi làm tiếp không nghỉ.",
  "Drive up and throw the ball to a mark on the wall, then catch it into the next squat.":
    "Bật lên và ném bóng vào điểm đánh dấu trên tường, rồi bắt bóng xuống squat tiếp.",
  "Drive your knees forward and lean back, keeping hips and shoulders in a straight line.":
    "Đẩy gối tới trước và ngả người ra sau, giữ hông và vai thẳng hàng.",
  "Drop into a lunge until both knees are bent to a right angle.":
    "Hạ xuống lunge tới khi cả hai gối gập vuông góc.",
  "Drop into a squat, plant the hands and kick the feet back to a plank.":
    "Hạ xuống squat, chống hai tay và đạp chân ra sau thành plank.",
  "Drop straight into a full squat, stand, and go again without a pause.":
    "Hạ thẳng xuống squat sâu, đứng lên, và làm lại không nghỉ.",
  "Dumbbell Power Clean": "Power Clean tạ đơn",
  "Dumbbell Swing": "Vung tạ đơn",
  "Dumbbell Thrusters": "Thruster tạ đơn",
  "Dumbbell Walking Lunges": "Lunge đi tới với tạ đơn",
  "Elbows straight back, hips close to the bench.":
    "Khuỷu tay đẩy thẳng ra sau, hông sát ghế.",
  "Everything from a bar, plus the floor work that earns it.":
    "Tất cả đều treo trên xà, cộng thêm phần bài dưới sàn để đủ sức làm được.",
  "Everything you have. Twenty seconds.": "Tất cả những gì bạn có. Hai mươi giây.",
  "Explode up, switch legs mid-air, and absorb the landing into the next lunge.":
    "Bật mạnh lên, đổi chân trên không, và hãm lực tiếp đất vào lunge kế tiếp.",
  "Extend that leg into a side kick and bring it straight back. Swap sides halfway.":
    "Duỗi chân đó thành cú đá ngang rồi thu thẳng về. Đổi bên khi được nửa thời gian.",
  "Extend the hips hard, pull them up, and catch them on your shoulders in a quarter squat.":
    "Duỗi hông thật mạnh, kéo tạ lên, và đón chúng trên vai ở tư thế squat nông.",
  "Eyes on the bell. One stage at a time.": "Mắt nhìn quả tạ. Đi từng bước một.",
  "Fighter Conditioning": "Thể lực võ sĩ",
  "Fire a side kick off one leg at the top, and alternate legs each rep.":
    "Đá ngang bằng một chân ở trên đỉnh, và đổi chân mỗi lần.",
  "Five three-minute rounds of striking work with a minute between them, the way a fight is scored.":
    "Năm hiệp ba phút đánh đòn, nghỉ một phút giữa hiệp, đúng như cách tính hiệp một trận đấu.",
  "Floor to overhead in one pull.": "Từ sàn lên quá đầu trong một nhịp kéo.",
  "Floor to standing with the bell locked overhead.":
    "Từ nằm lên đứng với tạ khoá thẳng trên đầu.",
  "Fold in half, hands to feet.": "Gập người làm đôi, tay chạm chân.",
  "Forearms to hands and back, no hip swing.":
    "Từ khuỷu tay lên bàn tay rồi xuống, hông không lắc.",
  "Four burpee variations, three rounds, nowhere to hide. The hardest thing here.":
    "Bốn biến thể burpee, ba vòng, không có chỗ nào để trốn. Bài nặng nhất ở đây.",
  "Full Body Assault": "Tấn công toàn thân",
  "Full chest to the floor every rep.": "Ngực chạm hẳn sàn ở mỗi lần.",
  "Full squat, then punch both arms up.": "Squat sâu, rồi đẩy thẳng hai tay lên.",
  "Full squat, then throw from the hips.": "Squat sâu, rồi ném bằng lực hông.",
  "Get into a high plank with your shins resting on an exercise ball.":
    "Vào tư thế plank cao với cẳng chân đặt trên bóng tập.",
  "Glute-Ham Raise": "Nâng thân bằng cơ đùi sau",
  "Grip": "Lực nắm",
  "Grip the bar with your hands almost touching.": "Nắm xà với hai tay gần chạm nhau.",
  "Half an hour of loaded work at conditioning pace. Pick a weight you can still move fast at the end.":
    "Nửa tiếng tập có tạ với nhịp thể lực. Chọn mức tạ mà tới cuối bài bạn vẫn đẩy nhanh được.",
  "Half an hour, no equipment at all, and no easy movement in it anywhere.":
    "Nửa tiếng, hoàn toàn không dụng cụ, và không có động tác nào dễ thở.",
  "Hand-Release Push-Ups": "Chống đẩy nhấc tay khỏi sàn",
  "Hands behind your head, elbows wide, standing tall.":
    "Hai tay sau đầu, khuỷu tay mở rộng, đứng thẳng.",
  "Hands together, elbows driving down.": "Hai tay sát nhau, khuỷu tay kéo xuống.",
  "Hands wide, chest doing the work.": "Tay đặt rộng, để cơ ngực làm việc.",
  "Handstand Push-Ups": "Chống đẩy trồng chuối",
  "Hang a plate or dumbbell from a belt and support yourself on the bars.":
    "Treo bánh tạ hoặc tạ đơn vào đai và chống người trên hai thanh xà.",
  "Hang from a bar with active shoulders and no swing.":
    "Treo trên xà với vai chủ động và không đánh đà.",
  "Hang from a bar with your body tight and still.":
    "Treo trên xà với thân người siết chặt và đứng yên.",
  "Hang from a bar with your shoulders active and your body tight.":
    "Treo trên xà với vai chủ động và thân người siết chặt.",
  "Hanging Core": "Cơ bụng treo xà",
  "Hanging, knees up to touch the elbows.": "Treo xà, kéo gối lên chạm khuỷu tay.",
  "Hard Core": "Bụng thép",
  "Head lower than the hips, curl up hard.":
    "Đầu thấp hơn hông, cuộn người lên thật mạnh.",
  "High-Knee Squat": "Nâng cao đùi kèm squat",
  "Hike the bell back with one hand and keep the free arm out for balance.":
    "Hất tạ ra sau bằng một tay và đưa tay còn lại ra để giữ thăng bằng.",
  "Hindu Push-Ups": "Chống đẩy kiểu Hindu",
  "Hinge and drive down through the handles.": "Gập hông và dồn lực kéo tay xuống.",
  "Hinge and grip one dumbbell between your feet.":
    "Gập người và nắm một quả tạ đơn giữa hai bàn chân.",
  "Hinge and walk your hands out to a plank.": "Gập hông và bò hai tay ra thành plank.",
  "Hinge and walk your hands out until you are in a long plank.":
    "Gập hông và bò hai tay ra tới khi thành plank dài.",
  "Hinge at the hips and hike the bell back between your legs.":
    "Gập ở hông và hất quả tạ ra sau giữa hai chân.",
  "Hinge down and grip both dumbbells on the floor with a flat back.":
    "Gập người xuống và nắm hai quả tạ trên sàn với lưng phẳng.",
  "Hips stay open. Do not fold at the waist.": "Hông giữ mở. Đừng gập ở eo.",
  "Hit the bottom of the squat every rep.": "Xuống hết đáy squat ở mỗi lần.",
  "Hold a dumbbell in each hand at your sides.":
    "Mỗi tay cầm một quả tạ đơn buông dọc thân.",
  "Hold a forearm plank and lift one foot a few inches off the floor.":
    "Giữ plank khuỷu tay và nhấc một bàn chân lên vài phân khỏi sàn.",
  "Hold a forearm plank with your feet a little apart.":
    "Giữ plank khuỷu tay với hai chân hơi tách ra.",
  "Hold a forearm plank with your feet wide.":
    "Giữ plank khuỷu tay với hai chân đặt rộng.",
  "Hold a high plank with your feet wide for balance.":
    "Giữ plank cao với hai chân đặt rộng để cân bằng.",
  "Hold a kettlebell at chest height with both hands.":
    "Giữ quả tạ ấm ngang ngực bằng cả hai tay.",
  "Hold a medicine ball at your chest and squat below parallel.":
    "Ôm bóng tạ trước ngực và squat xuống dưới song song.",
  "Hold a strong plank with your hands under your shoulders.":
    "Giữ plank chắc với hai tay dưới vai.",
  "Hold one dumbbell with both hands and hinge it back between your legs.":
    "Cầm một quả tạ đơn bằng hai tay và hất ra sau giữa hai chân.",
  "Hold one rope end in each hand in a quarter squat.":
    "Mỗi tay cầm một đầu dây, giữ tư thế squat nông.",
  "Hold something for balance and rise onto the balls of your feet.":
    "Bám vào vật gì đó để giữ thăng bằng và nhón lên nửa bàn chân trước.",
  "Hold the dumbbells at your shoulders and squat to depth.":
    "Giữ tạ đơn ở vai và squat xuống hết biên độ.",
  "Hold the V shape with a tall chest, arms reaching past your knees.":
    "Giữ hình chữ V với ngực ngẩng, hai tay vươn qua khỏi gối.",
  "Hook your feet at the top of a decline bench and lie back.":
    "Móc chân ở đầu trên của ghế dốc xuống rồi nằm ngửa ra.",
  "Inchworm To Climbers": "Bò tay ra kèm leo núi",
  "Iron Conditioning": "Thể lực sắt",
  "Jump a little higher than a single, and turn the rope twice underneath.":
    "Bật cao hơn nhịp đơn một chút, và quay dây hai vòng bên dưới.",
  "Jump again and switch which foot leads, staying light and quick.":
    "Bật tiếp và đổi chân dẫn trước, giữ người nhẹ và nhanh.",
  "Jump and cross one foot in front of the other.":
    "Bật lên và bắt chéo một chân ra trước chân kia.",
  "Jump and pull your chin over the bar, then lower under control.":
    "Bật lên và kéo cằm qua xà, rồi hạ xuống có kiểm soát.",
  "Jump into it, lower yourself slowly.": "Bật lên rồi hạ người thật chậm.",
  "Jump Lunges": "Lunge bật đổi chân",
  "Jump the feet back under you into a deep squat, then drive up and jump.":
    "Bật chân về dưới thân thành squat sâu, rồi bật mạnh lên.",
  "Jump up and land softly with both feet flat, stand tall, then step down.":
    "Bật lên và tiếp đất êm với cả hai bàn chân phẳng, đứng thẳng, rồi bước xuống.",
  "Jump up, stand all the way tall, step back down.":
    "Bật lên, đứng thẳng hẳn, rồi bước xuống.",
  "Jump up, switch which foot lands on the box, and keep the rhythm going.":
    "Bật lên, đổi chân đặt trên bục, và giữ nhịp liên tục.",
  "Jumping only. Every rep leaves the floor and every landing has to be absorbed.":
    "Toàn bài bật nhảy. Mỗi lần đều rời sàn và mỗi lần tiếp đất đều phải hãm lực.",
  "Jumping Pull-Ups": "Hít xà có bật nhảy",
  "Keep the elbows in and the arms quiet - the wrists do all of the speed.":
    "Khuỷu tay khép và tay giữ yên - cổ tay lo toàn bộ tốc độ.",
  "Keep the hips low through the climbers.": "Giữ hông thấp suốt phần leo núi.",
  "Keep the hips square and level, and swap legs halfway through.":
    "Giữ hông vuông và ngang bằng, đổi chân khi được nửa thời gian.",
  "Keep the hips still. Nothing rocks.": "Giữ hông đứng yên. Không lắc lư gì cả.",
  "Keep the legs straight. Slow on the way down.":
    "Giữ chân thẳng. Hạ xuống thật chậm.",
  "Kettlebell Goblet Squat": "Goblet Squat với tạ ấm",
  "Kettlebell Swing": "Vung tạ ấm (Kettlebell Swing)",
  "Kettlebell Thrusters": "Thruster tạ ấm",
  "Kick up into a handstand with your heels resting on a wall.":
    "Đá chân lên thành trồng chuối với gót tựa vào tường.",
  "Kick up to the wall, lower the head to the floor.":
    "Trồng chuối tựa tường, hạ đầu xuống sàn.",
  "Kip in a circle, keep the rhythm unbroken.":
    "Đánh đà theo vòng tròn, giữ nhịp không đứt.",
  "Knee Thrusts": "Kéo gối lên",
  "Knee to the elbow on the way down.": "Kéo gối lên chạm khuỷu tay khi hạ người.",
  "Knee to the same elbow, hips square.":
    "Gối chạm khuỷu tay cùng bên, hông giữ vuông.",
  "Knee up, then extend the kick out.": "Nâng gối lên, rồi duỗi chân đá ra.",
  "Kneel and hold the wheel under your shoulders with your hips tucked.":
    "Quỳ và giữ bánh xe dưới vai với hông cuộn vào.",
  "Kneel with your ankles anchored and your body upright.":
    "Quỳ với cổ chân được giữ cố định và thân người dựng thẳng.",
  "Knees forward, hips and shoulders in one line.":
    "Gối đẩy tới trước, hông và vai thẳng hàng.",
  "Knees To Elbows": "Treo xà kéo gối chạm khuỷu",
  "Lean forward slightly, full depth.": "Hơi ngả người tới trước, hạ hết biên độ.",
  "Legs": "Chân",
  "Lie back with your hands behind your head and both feet lifted.":
    "Nằm ngửa với hai tay sau đầu và cả hai chân nhấc lên.",
  "Lie back with your knees bent and feet anchored or flat.":
    "Nằm ngửa với gối gập và bàn chân được giữ hoặc đặt phẳng.",
  "Lie face down and lift your chest and arms off the floor.":
    "Nằm sấp và nhấc ngực cùng hai tay khỏi sàn.",
  "Lie flat with your arms overhead and your legs straight.":
    "Nằm thẳng với hai tay qua đầu và hai chân duỗi thẳng.",
  "Lie on a bench and grip behind your head, then drive your legs and hips up over your shoulders.":
    "Nằm trên ghế và bám phía sau đầu, rồi đẩy chân và hông lên qua khỏi vai.",
  "Lie on one side propped on your forearm with your legs long.":
    "Nằm nghiêng chống trên cẳng tay với hai chân duỗi dài.",
  "Lie on your back holding a kettlebell straight up in one arm.":
    "Nằm ngửa, một tay giữ quả tạ ấm thẳng lên trên.",
  "Lift both hands off for a moment, put them back down, and press up.":
    "Nhấc cả hai tay lên một nhịp, đặt lại xuống, rồi đẩy lên.",
  "Lift one straight arm out to the side to shoulder height, lower it, and alternate.":
    "Nâng một tay duỗi thẳng sang ngang lên ngang vai, hạ xuống, rồi đổi bên.",
  "Lift the arms and legs together to meet over your hips, then lower without touching down.":
    "Nâng tay và chân cùng lúc để gặp nhau phía trên hông, rồi hạ xuống mà không chạm sàn.",
  "Load one arm, the other stays straight.": "Dồn lực một tay, tay kia giữ thẳng.",
  "Loaded Conditioning": "Thể lực có tạ",
  "Loaded, and the back knee still touches down.":
    "Có tạ, và gối sau vẫn phải chạm sàn.",
  "Long step back, both arms overhead.": "Bước lùi thật dài, hai tay đưa lên quá đầu.",
  "Lower all the way until your chest is on the floor.":
    "Hạ xuống hết cỡ tới khi ngực chạm sàn.",
  "Lower as slowly as you can hold it.": "Hạ xuống chậm nhất mức bạn còn giữ được.",
  "Lower into a push-up and bring one knee up to the elbow on that side.":
    "Hạ xuống chống đẩy và kéo một gối lên chạm khuỷu tay bên đó.",
  "Lower the whole body as one straight line as slowly as you can, without letting the hips bend.":
    "Hạ toàn thân xuống như một đường thẳng, chậm nhất có thể, không để hông gập lại.",
  "Lower towards one hand keeping the other arm straight, press back up, and alternate.":
    "Hạ người về phía một tay trong khi tay kia giữ thẳng, đẩy lên, rồi đổi bên.",
  "Lower until your chest is just off the floor and press back up.":
    "Hạ xuống tới khi ngực gần chạm sàn rồi đẩy lên.",
  "Lower until your shoulders are below your elbows, then press back to the top.":
    "Hạ xuống tới khi vai thấp hơn khuỷu tay, rồi đẩy lên đỉnh.",
  "Lower your torso towards the floor as slowly as possible, then pull yourself back up.":
    "Hạ thân trên xuống sàn chậm nhất có thể, rồi kéo người lên.",
  "Lunge forward until the back knee is just off the floor, then step straight into the next one.":
    "Lunge tới trước tới khi gối sau gần chạm sàn, rồi bước thẳng vào nhịp kế tiếp.",
  "Lying on your side, knee to elbow.": "Nằm nghiêng, kéo gối chạm khuỷu tay.",
  "Maximum effort": "Dốc toàn lực",
  "No crunches. Long holds and full-body core work, straight through with ten seconds between.":
    "Không có gập bụng thường. Toàn giữ lâu và bài cơ trung tâm toàn thân, chạy liền mạch với mười giây nghỉ.",
  "No equipment": "Không dụng cụ",
  "One foot on the box, swap in the air.": "Một chân trên bục, đổi chân trên không.",
  "One foot up, hips dead level.": "Nhấc một chân, hông tuyệt đối ngang bằng.",
  "One leg down to the box, one leg back up.":
    "Hạ xuống bục bằng một chân, đứng lên cũng bằng chân đó.",
  "One movement. Do not stop at the top of the squat.":
    "Một động tác liền mạch. Đừng dừng ở đỉnh của squat.",
  "One-Arm Dumbbell Snatch": "Snatch tạ đơn một tay",
  "One-Arm Kettlebell Swing": "Vung tạ ấm một tay",
  "Opposite elbow meets the knee, from standing.":
    "Khuỷu tay đối diện chạm gối, ở tư thế đứng.",
  "Perform a full burpee back to standing.":
    "Thực hiện một burpee đầy đủ về tư thế đứng.",
  "Perform a full push-up with your chest to the floor.":
    "Thực hiện một lần chống đẩy đầy đủ với ngực chạm sàn.",
  "Planfit Assault Run: a curved manual treadmill. The same interval works on any treadmill, a bike, or outdoors.":
    "Planfit Assault Run: máy chạy cong không động cơ. Cùng khoảng nghỉ đó áp dụng được cho mọi máy chạy, xe đạp tập hoặc chạy ngoài trời.",
  "Planfit Forward Neck Flexion Stretch: it starts from the same chin-in retraction, then continues into a larger neck stretch.":
    "Planfit Forward Neck Flexion Stretch: bắt đầu từ cùng động tác thu cằm, rồi kéo dài thành một bài giãn cổ rộng hơn.",
  "Planfit High Knee Skips: the same knee drive and arm action, demonstrated with a small skip between reps.":
    "Planfit High Knee Skips: cùng động tác nâng gối và đánh tay, được minh hoạ kèm một nhịp bật nhỏ giữa các lần.",
  "Plank Lateral Raise": "Plank nâng tay ngang",
  "Plank to side plank and back, hips high.":
    "Từ plank sang plank nghiêng rồi về, hông giữ cao.",
  "Plank-Ups": "Plank lên xuống tay",
  "Plyo Power": "Sức bật Plyo",
  "Power": "Sức bật",
  "Press back up as the foot returns, and alternate legs each rep.":
    "Đẩy lên khi chân thu về, và đổi chân mỗi lần.",
  "Press up onto one hand at a time to a high plank, then back down. Alternate the lead arm.":
    "Chống lên từng tay một thành plank cao, rồi hạ xuống. Đổi tay dẫn luân phiên.",
  "Pull both knees up to touch your elbows, then lower under control.":
    "Kéo cả hai gối lên chạm khuỷu tay, rồi hạ xuống có kiểm soát.",
  "Pull down hard, hinging at the hips, and finish with the hands past your thighs.":
    "Kéo xuống thật mạnh, gập ở hông, và kết thúc với hai tay qua khỏi đùi.",
  "Pull from the floor, catch at the shoulders.": "Kéo từ sàn, đón tạ ở vai.",
  "Pull the knee hard into your hands.": "Kéo mạnh gối vào hai tay.",
  "Pull to one hand, the other arm stays long.":
    "Kéo về một tay, tay kia giữ duỗi thẳng.",
  "Pull until your chin clears the bar, then lower under control.":
    "Kéo tới khi cằm qua khỏi xà, rồi hạ xuống có kiểm soát.",
  "Pull up towards one hand while the other arm stays straight, then alternate.":
    "Kéo người về phía một tay trong khi tay kia giữ thẳng, rồi đổi bên.",
  "Pull your chest towards the bar, then lower all the way to straight arms.":
    "Kéo ngực về phía xà, rồi hạ xuống hết cho tay thẳng.",
  "Pull your knees towards your chest, rolling the ball in, then extend back out.":
    "Kéo gối về phía ngực, lăn bóng vào, rồi duỗi trở ra.",
  "Push and pull with the arms as hard as you drive with the legs for the whole interval.":
    "Đẩy và kéo bằng tay mạnh ngang với đạp bằng chân trong suốt khoảng thời gian đó.",
  "Push away from the bar at the top and let the circle carry you into the next rep.":
    "Đẩy người ra khỏi xà ở trên đỉnh và để vòng đà đưa bạn vào nhịp kế tiếp.",
  "Push up again and keep travelling, changing direction when you run out of room.":
    "Chống đẩy tiếp và tiếp tục di chuyển, đổi hướng khi hết chỗ.",
  "Push up, then open into a side plank.":
    "Chống đẩy, rồi xoay mở thành plank nghiêng.",
  "Push up, then travel sideways on your hands.":
    "Chống đẩy, rồi di chuyển ngang bằng tay.",
  "Pushing and pulling at conditioning pace, with no let-up for the arms.":
    "Đẩy và kéo với nhịp thể lực, không cho tay nghỉ chút nào.",
  "Put a band around your legs above the knees and drop into a quarter squat.":
    "Quàng dây kháng lực quanh chân trên gối và hạ xuống squat nông.",
  "Put one foot on the box and drop into a split stance.":
    "Đặt một chân lên bục và hạ xuống tư thế tấn trước sau.",
  "Rack the bells on your forearms at shoulder height and squat to depth.":
    "Đặt tạ lên cẳng tay ở ngang vai và squat xuống hết biên độ.",
  "Rainbow Plank": "Plank vẽ cầu vồng",
  "Raise both legs to hip height or higher, then lower without swinging.":
    "Nâng cả hai chân lên ngang hông hoặc cao hơn, rồi hạ xuống không đánh đà.",
  "Raise both straight legs to at least hip height, then lower slowly.":
    "Nâng cả hai chân duỗi thẳng lên ít nhất ngang hông, rồi hạ xuống từ từ.",
  "Raise one arm out sideways without twisting.":
    "Nâng một tay sang ngang mà không xoay người.",
  "Reach both arms overhead and stand tall.":
    "Đưa cả hai tay lên quá đầu và đứng thẳng.",
  "Reach both arms overhead as you sink, then drive back to standing.":
    "Đưa hai tay lên quá đầu khi hạ người, rồi đạp về tư thế đứng.",
  "Reach both hands high on one side and hinge into a quarter squat.":
    "Đưa hai tay lên cao về một bên và gập xuống squat nông.",
  "Reach the handles high with soft knees.": "Vươn tay cầm lên cao với gối hơi chùng.",
  "Roll out as far as you can hold a flat back, then pull yourself back in.":
    "Lăn ra xa nhất mức còn giữ được lưng phẳng, rồi kéo người về.",
  "Roll out only as far as the ribs stay down.":
    "Chỉ lăn ra xa tới mức lồng ngực còn hạ xuống được.",
  "Rotate one elbow towards the opposite knee as the other leg extends, slowly.":
    "Xoay một khuỷu tay về phía gối đối diện trong khi chân kia duỗi ra, thật chậm.",
  "Rotate onto one forearm into a side plank, return to centre, and alternate sides.":
    "Xoay lên một cẳng tay thành plank nghiêng, về giữa, rồi đổi bên luân phiên.",
  "Rotate the hips down towards one side, then sweep through to the other in an arc.":
    "Xoay hông hạ xuống một bên, rồi quét qua bên kia theo một vòng cung.",
  "Rotation Plank": "Plank xoay người",
  "Rotation Push-Ups": "Chống đẩy xoay người",
  "Row both elbows back past your ribs, squeeze, and reach forward again without dropping.":
    "Kéo hai khuỷu tay ra sau qua khỏi sườn, siết lại, rồi vươn tới trước mà không hạ người xuống.",
  "Run flat out for the whole interval, arms driving.":
    "Chạy hết sức suốt khoảng thời gian đó, tay đánh mạnh.",
  "Run four mountain climbers, walk the hands back in and stand tall.":
    "Thực hiện bốn nhịp leo núi, bò tay về và đứng thẳng lên.",
  "Same hinge, one hand, shoulders square.": "Vẫn là gập hông, một tay, vai giữ vuông.",
  "Same hip snap, one dumbbell.": "Vẫn bật hông như vậy, với một quả tạ đơn.",
  "Scissor the feet in the air, fast.": "Bắt chéo chân trên không, thật nhanh.",
  "Set up with the seat at hip height and grip the handles.":
    "Chỉnh yên ngang hông và nắm lấy tay cầm.",
  "Set your hands well outside shoulder width.":
    "Đặt hai tay rộng hơn hẳn chiều rộng vai.",
  "Shins on the ball, pull the knees to the chest.":
    "Cẳng chân đặt trên bóng, kéo gối về phía ngực.",
  "Side Knee-Ups": "Nằm nghiêng kéo gối",
  "Side Lunges": "Lunge ngang",
  "Side Mountain Climbers": "Leo núi ngang",
  "Side Raise And Kick": "Nâng gối ngang rồi đá",
  "Single-Leg Plank": "Plank một chân",
  "Sink until both knees are bent, then drive back to standing and swap sides.":
    "Hạ xuống tới khi cả hai gối gập, rồi đạp về tư thế đứng và đổi bên.",
  "Sissy Squats": "Sissy Squat",
  "Sit all the way up until your chest meets your thighs, then lower with control.":
    "Ngồi dậy hết cỡ tới khi ngực chạm đùi, rồi hạ xuống có kiểm soát.",
  "Sit and lift both legs so you are balanced on your sit bones.":
    "Ngồi và nhấc cả hai chân lên để giữ thăng bằng trên xương ngồi.",
  "Sit back until you touch the box, then stand up on that same leg. Swap sides halfway.":
    "Hạ hông ra sau tới khi chạm bục, rồi đứng lên bằng chính chân đó. Đổi bên khi được nửa thời gian.",
  "Sit into one hip, the other leg stays straight.":
    "Dồn trọng lượng vào một bên hông, chân kia duỗi thẳng.",
  "Sit on the edge of a bench with your hands beside your hips and slide forward.":
    "Ngồi mép ghế với hai tay cạnh hông rồi trượt người ra trước.",
  "Sit-Ups": "Gập bụng ngồi lên (Sit-Up)",
  "Ski Erg": "Máy chèo Ski Erg",
  "Slow rotation, both shoulders off the floor.": "Xoay chậm, cả hai vai rời khỏi sàn.",
  "Snap the hips - the arms just hold on.": "Bật hông dứt khoát - tay chỉ giữ tạ.",
  "Snap the hips forward to float it to chest height, then let it fall back into the next rep.":
    "Bật hông tới trước để đưa tạ lên ngang ngực, rồi để nó rơi xuống vào nhịp kế tiếp.",
  "Snap the hips forward to swing it to chest height, then let it fall into the next rep.":
    "Bật hông tới trước để vung tạ lên ngang ngực, rồi để nó rơi vào nhịp kế tiếp.",
  "Snap the hips to swing it to chest height without letting the torso rotate.":
    "Bật hông để vung tạ lên ngang ngực mà không để thân người xoay.",
  "Spiderman Push-Ups": "Chống đẩy người nhện",
  "Split Jump To Box": "Bật đổi chân lên bục",
  "Sprint Intervals": "Chạy nước rút ngắt quãng",
  "Squat and press as one movement.": "Squat và đẩy thành một động tác liền.",
  "Squat as deep as you can hold a flat back.":
    "Squat sâu nhất mức bạn còn giữ được lưng phẳng.",
  "Squat between your feet keeping the chest tall, then stand and squeeze.":
    "Squat xuống giữa hai chân, giữ ngực ngẩng, rồi đứng lên và siết mông.",
  "Squat Burpee": "Burpee kèm squat sâu",
  "Squat down and touch the floor beside one heel.":
    "Hạ người xuống squat và chạm sàn bên cạnh một gót chân.",
  "Squat To Overhead Reach": "Squat kèm vươn tay lên cao",
  "Squat, Touch And Kick": "Squat, chạm sàn rồi đá",
  "Squat, touch the floor, kick out.": "Squat, chạm sàn, rồi đá ra.",
  "Stand a short step from the box, load the hips and swing the arms.":
    "Đứng cách bục một bước ngắn, dồn lực vào hông và vung tay.",
  "Stand and fire a side kick off that leg, then repeat on the other side.":
    "Đứng lên và đá ngang bằng chân đó, rồi lặp lại với bên kia.",
  "Stand hard and press them overhead in one motion, then return to the rack.":
    "Đứng lên dứt khoát và đẩy tạ lên quá đầu trong một nhịp, rồi đưa về vị trí tựa vai.",
  "Stand on one leg in front of a box with the other leg held out in front.":
    "Đứng một chân trước bục, chân kia đưa thẳng ra trước.",
  "Stand tall and lift one knee out to the side to hip height.":
    "Đứng thẳng và nâng một gối ra ngang lên tới ngang hông.",
  "Stand under a bar you can reach with a small jump.":
    "Đứng dưới thanh xà mà bạn với tới được bằng một cú bật nhỏ.",
  "Stand up one stage at a time keeping the arm vertical throughout, then reverse it. Swap sides halfway.":
    "Đứng dậy theo từng bước một, giữ tay luôn thẳng đứng, rồi làm ngược lại. Đổi bên khi được nửa thời gian.",
  "Stand wide over a kettlebell and grip it with both hands.":
    "Đứng tấn rộng trên quả tạ ấm và nắm bằng cả hai tay.",
  "Start hips high, then dive your chest low between your hands.":
    "Bắt đầu với hông cao, rồi chúi ngực xuống thấp giữa hai tay.",
  "Start in a forearm plank with your feet a little wider than usual.":
    "Bắt đầu ở plank khuỷu tay với hai chân rộng hơn bình thường một chút.",
  "Stay low, tension never goes slack.": "Giữ người thấp, dây không bao giờ chùng.",
  "Stay low. Do not let the waves die.": "Giữ người thấp. Đừng để sóng dây tắt.",
  "Steady Circuit": "Vòng tập đều nhịp",
  "Step back and across, hips square.": "Bước lùi và chéo ra sau, hông giữ vuông.",
  "Step Back And Reach": "Bước lùi kèm vươn tay",
  "Step forward into a lunge until the back knee nearly touches down.":
    "Bước tới thành lunge tới khi gối sau gần chạm sàn.",
  "Step off and walk it down the moment the clock stops.":
    "Bước xuống và đi bộ hạ nhịp ngay khi đồng hồ dừng.",
  "Step one foot back and across behind the other.":
    "Bước một chân ra sau và chéo qua sau chân kia.",
  "Step sideways without letting the feet come together, and change direction halfway.":
    "Bước ngang mà không để hai chân khép lại, và đổi hướng khi được nửa thời gian.",
  "Straight legs to horizontal, no swing.": "Chân duỗi thẳng lên ngang, không đánh đà.",
  "Strength endurance": "Sức bền cơ bắp",
  "Sumo Deadlift High Pull": "Deadlift sumo kéo cao",
  "Superman Row": "Superman kèm kéo tay",
  "Support yourself on the arm pads with your back against the rest.":
    "Chống người trên hai đệm tay với lưng tựa vào tấm lưng ghế.",
  "Swap legs in the air, land deep and quiet.":
    "Đổi chân trên không, tiếp đất sâu và êm.",
  "Sweep forward and up into a cobra, then push back to the start along the same path.":
    "Lướt tới trước và lên thành tư thế rắn hổ mang, rồi đẩy ngược về vị trí ban đầu theo cùng đường đó.",
  "Swing into an arch, then pull as the hips drive forward.":
    "Đánh đà thành thế ưỡn, rồi kéo lên khi hông đẩy tới trước.",
  "Swing them down and across past the opposite hip, then reverse. Swap sides halfway.":
    "Vung hai tay xuống chéo qua hông bên kia, rồi làm ngược lại. Đổi bên khi được nửa thời gian.",
  "Tabata Blitz": "Tabata cấp tốc",
  "Take a grip well outside shoulder width with your palms forward.":
    "Nắm xà rộng hơn hẳn vai với lòng bàn tay hướng ra trước.",
  "Take a long step back into a lunge.": "Bước lùi một bước dài thành tư thế lunge.",
  "Take a wide grip on the bar.": "Nắm xà với tay đặt rộng.",
  "Take a wide hand position in a push-up.": "Đặt tay rộng ở tư thế chống đẩy.",
  "Take a wide step out to one side and push your hips back.":
    "Bước rộng sang một bên và đẩy hông ra sau.",
  "Ten movements, three rounds, nothing repeated back to back. Twenty-six minutes of work.":
    "Mười động tác, ba vòng, không lặp lại liên tiếp động tác nào. Hai mươi sáu phút làm việc.",
  "The Grinder": "Bài nghiền",
  "This is a hinge, not a squat. Squeeze at the top.":
    "Đây là động tác gập hông, không phải squat. Siết mông ở điểm cao nhất.",
  "Toes To Bar": "Nâng chân chạm xà",
  "Toes to the bar, no swinging for free reps.":
    "Mũi chân chạm xà, không đánh đà lấy số.",
  "Travel forward, back knee just off the floor.":
    "Đi tới trước, gối sau gần chạm sàn.",
  "Turkish Get-Up": "Turkish Get-Up",
  "Twelve core movements, twice through. Twenty-three minutes and no crunch repeated twice.":
    "Mười hai động tác cơ trung tâm, chạy hai lượt. Hai mươi ba phút và không lặp lại kiểu gập bụng nào.",
  "Twelve movements, twice through, twenty-five minutes. The long one - pace it or it will end you early.":
    "Mười hai động tác, chạy hai lượt, hai mươi lăm phút. Bài dài - phải chia sức, không thì gục sớm.",
  "Twenty minutes at a pace you can hold. Ten movements, two rounds, generous rest.":
    "Hai mươi phút với nhịp bạn giữ được. Mười động tác, hai vòng, nghỉ thoải mái.",
  "Twenty seconds all out, ten seconds off, eight times through. Four minutes that feel much longer.":
    "Hai mươi giây dốc toàn lực, mười giây nghỉ, lặp tám lần. Bốn phút mà cảm giác dài hơn nhiều.",
  "Twenty-four minutes of pushing and pulling. The arms give out long before the lungs do.":
    "Hai mươi bốn phút đẩy và kéo. Tay sẽ đuối trước phổi rất lâu.",
  "Twisting Knee Thrusts": "Kéo gối lên có xoay người",
  "Two knee drives, then a full squat.": "Hai nhịp nâng gối, rồi một lần squat sâu.",
  "Two rope turns for every jump.": "Hai vòng dây cho mỗi lần bật.",
  "Upper body": "Thân trên",
  "Upper Body Assault": "Tấn công thân trên",
  "Upper Body Gauntlet": "Thử thách thân trên",
  "V-Sit Hold": "Giữ tư thế chữ V",
  "V-Ups": "Gập bụng chữ V",
  "Walk out, climb, walk back, stand.": "Bò tay ra, leo núi, bò tay về, đứng lên.",
  "Walk The Dog": "Bò tay tiến lùi",
  "Walk the hands out, walk them back.": "Bò hai tay ra, rồi bò về.",
  "Walk them back to your feet and stand tall, keeping the legs as straight as you can.":
    "Bò tay về lại chỗ bàn chân và đứng thẳng, giữ chân thẳng nhất có thể.",
  "Walking Lunges": "Lunge đi tới",
  "Walking Push-Ups": "Chống đẩy di chuyển ngang",
  "Wall Balls": "Ném bóng vào tường",
  "Waves from the hips, not the shoulders.": "Tạo sóng từ hông, không phải từ vai.",
  "Weighted Dips": "Xà kép có tạ",
  "Weights moved fast. Harder on the lungs than anything without them.":
    "Nâng tạ với tốc độ cao. Nặng cho phổi hơn bất kỳ bài tay không nào.",
  "Whole body one rigid line, lowering slowly.":
    "Toàn thân thành một đường cứng, hạ xuống thật chậm.",
  "Wide hands, chest to the bar.": "Tay đặt rộng, ngực chạm xà.",
  "Wide Push-Ups": "Chống đẩy tay rộng",
  "Wide stance, pull it to your chin.": "Đứng tấn rộng, kéo tạ lên tới cằm.",
  "Wide-Grip Pull-Ups": "Hít xà tay rộng",
  "Woodchoppers": "Bổ củi (Woodchopper)",
}
