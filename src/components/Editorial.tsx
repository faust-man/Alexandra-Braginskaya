export function Editorial({ section }: { section: "about" | "contacts" }) {
  return section === "about" ? (
    <section id="about">
      <div className="container">
        <h2>О художнице</h2>

        <p>
          Меня привлекают разные сферы искусства. Я развиваюсь не только как
          художник, но и как искусствовед. Пишу рецензии на выставки и яркие
          события современного искусства, участвую в арт-проектах и исследую
          культуру нашей страны через творчество.
        </p>

        <p>
          В своих работах я часто соединяю элементы академической живописи и
          современные художественные техники.
        </p>
      </div>
    </section>
  ) : (
    <section id="contacts">
      <div className="container">
        <h2>Контакты</h2>

        <div className="contacts">
          <a
            href="https://vk.com/alexatorsher"
            target="_blank"
            rel="noopener noreferrer"
          >
            VK
          </a>

          <a
            href="https://t.me/artalexatorsher"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>

          <a
            href="https://dzen.ru/a/aH1S5kycwwCSteDz"
            target="_blank"
            rel="noopener noreferrer"
          >
            Яндекс Дзен
          </a>
          <a
            href="https://www.instagram.com/artalexatorsher/"
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby="instagram-note"
          >
            Instagram*
          </a>
        </div>
        <p id="instagram-note" className="social-note">
          *Деятельность организации Meta Platforms Inc. по реализации социальной
          сети Instagram признана экстремистской и запрещена на территории РФ.
        </p>
      </div>
    </section>
  );
}
