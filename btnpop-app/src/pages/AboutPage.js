import React from 'react';
import './aboutpage.css';
import jab from '../Content/Images/jab.jpg';
import jmc from '../Content/Images/jmc.jpg';
import ejm from '../Content/Images/idol ej.jpg';

const AboutPage = () => {
  const webTeam = [
    {
      id: 1,
      name: "John Andrew Bandojo",
      role: "Lead Developer",
      bio: "John Andrew was the mastermind behind the website's robust and scalable backend architecture. He focused on building a secure and efficient platform to support BTN Pop's growing community of artists and fans, ensuring data integrity and lightning-fast performance.",
      image: jab 
    },
    {
      id: 2,
      name: "Johnjov Mari Cariño",
      role: "Frontend Developer",
      bio: "Mari's expertise lies in crafting beautiful, responsive user interfaces that feel alive. He translated BTN Pop's vibrant energy into captivating visuals and smooth interactions, focusing on making the platform accessible and enjoyable for all users.",
      image: jmc
    },
    {
      id: 3,
      name: "Ed Jerome Manalo", 
      role: "UI/UX Strategist",
      bio:  "Jerome is passionate about creating intuitive and engaging digital experiences. With a keen eye for design and a strong foundation in full-stack development, Jerome led the charge in bringing the BTN Pop website to life, ensuring a seamless blend of aesthetics and functionality.",
      image: ejm 
    }
  ];

  return (
    <>
      <section className="about_hero">
        <div className="about_hero__content">
          <span className="about_hero__label">ABOUT US</span>
          <h1 className="about_hero__title">BTN ASSOCIATION</h1>
          <p className="about_hero__subtitle">Tara na Bataan!</p>
        </div>
      </section>

      <main className="about">
        <section className="story">
          <div className="story__container">
            <span className="story__label">Our Story</span>
            <p className="story__text">
              BTN Pop (Bataan Pop Fest) is more than just an event; it's a vibrant movement dedicated to
              celebrating and amplifying the unique voices of Bataan's talented artists.
              Born from a collective dream to forge a dynamic platform for original music and film,
              BTN Pop aims to nurture creativity, foster collaboration, and showcase the rich
              cultural tapestry of our province to the Philippines and the world. We are a flagship
              initiative of <strong>BTN Association, Inc.</strong>, a non-profit arts and media organization
              passionately committed to elevating Bataeño talent.
            </p>
          </div>
        </section>

        <section className="vision-mission">
          <div className="vision-mission__container">
            <div className="vision-mission__card">
              <span className="vision-mission__label">Our Vision</span>
              <p className="vision-mission__text">
                To see Bataan renowned as a vibrant and influential hub of original music and film,
                celebrating and empowering local artists on a national and global stage, fostering
                a sustainable ecosystem for creative expression.
              </p>
            </div>
            <div className="vision-mission__card">
              <span className="vision-mission__label">Our Mission</span>
              <p className="vision-mission__text">
                To discover, cultivate, and relentlessly promote Bataeño talent by providing an
                innovative and supportive platform for original music and film creation. We strive
                to foster a strong, collaborative community for artists and showcase their work to
                the widest possible audience through cutting-edge multimedia events, digital channels,
                and strategic partnerships.
              </p>
            </div>
          </div>
        </section>

        <section className="team">
          <div className="team__container">
            <span className="team__label">Meet the Team</span>
            <p className="team__description">
              This digital stage for BTN Pop was brought to you by a dedicated trio of tech enthusiasts
              who believe in the power of collaboration and code to connect and inspire.
            </p>
            <div className="team__grid">
              {webTeam.map(member => (
                <article key={member.id} className="team__card">
                  <div className="team__image-wrapper">
                    <img src={member.image} alt={member.name} className="team__image" />
                  </div>
                  <div className="team__content">
                    <h3 className="team__name">{member.name}</h3>
                    <span className="team__role">{member.role}</span>
                    <p className="team__bio">{member.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AboutPage;