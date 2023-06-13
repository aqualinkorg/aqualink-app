import React from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Container,
} from '@material-ui/core';

import NavBar from 'common/NavBar';
import Footer from 'common/Footer';

const Terms = ({ classes }: TermsProps) => {
  return (
    <>
      <NavBar searchLocation={false} />
      <Container className={classes.root}>
        <h1>Terms and Conditions</h1>
        <p>Last updated: October 08, 2020</p>
        <p>
          Please read these terms and conditions carefully before using Our
          Service.
        </p>
        <h1>Interpretation and Definitions</h1>
        <h2>Interpretation</h2>
        <p>
          The words of which the initial letter is capitalized have meanings
          defined under the following conditions. The following definitions
          shall have the same meaning regardless of whether they appear in
          singular or in plural.
        </p>
        <h2>Definitions</h2>
        <p>For the purposes of these Terms and Conditions:</p>
        <ul>
          <li>
            <p>
              <strong>Affiliate</strong> means an entity that controls, is
              controlled by or is under common control with a party, where
              &quot;control&quot; means ownership of 50% or more of the shares,
              equity interest or other securities entitled to vote for election
              of directors or other managing authority.
            </p>
          </li>
          <li>
            <p>
              <strong>Account</strong> means a unique account created for You to
              access our Service or parts of our Service.
            </p>
          </li>
          <li>
            <p>
              <strong>Country</strong> refers to: California, United States
            </p>
          </li>
          <li>
            <p>
              <strong>Company</strong> (referred to as either &quot;the
              Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot;
              in this Agreement) refers to Aqualink, 1740 20th street, San
              Francisco, CA.
            </p>
          </li>
          <li>
            <p>
              <strong>Content</strong> refers to content such as text, images,
              or other information that can be posted, uploaded, linked to or
              otherwise made available by You, regardless of the form of that
              content.
            </p>
          </li>
          <li>
            <p>
              <strong>Device</strong> means any device that can access the
              Service such as a computer, a cellphone or a digital tablet.
            </p>
          </li>
          <li>
            <p>
              <strong>Feedback</strong> means feedback, innovations or
              suggestions sent by You regarding the attributes, performance or
              features of our Service.
            </p>
          </li>
          <li>
            <p>
              <strong>Service</strong> refers to the Website.
            </p>
          </li>
          <li>
            <p>
              <strong>Terms and Conditions</strong> (also referred as
              &quot;Terms&quot;) mean these Terms and Conditions that form the
              entire agreement between You and the Company regarding the use of
              the Service.
            </p>
          </li>
          <li>
            <p>
              <strong>Third-party Social Media Service</strong> means any
              services or content (including data, information, products or
              services) provided by a third-party that may be displayed,
              included or made available by the Service.
            </p>
          </li>
          <li>
            <p>
              <strong>Website</strong> refers to Aqualink, accessible from{' '}
              <a
                href="http://www.aqualink.org"
                rel="noopener noreferrer"
                target="_blank"
              >
                http://www.aqualink.org
              </a>
            </p>
          </li>
          <li>
            <p>
              <strong>You</strong> means the individual accessing or using the
              Service, or the company, or other legal entity on behalf of which
              such individual is accessing or using the Service, as applicable.
            </p>
          </li>
        </ul>
        <h1>Acknowledgment</h1>
        <p>
          These are the Terms and Conditions governing the use of this Service
          and the agreement that operates between You and the Company. These
          Terms and Conditions set out the rights and obligations of all users
          regarding the use of the Service.
        </p>
        <p>
          Your access to and use of the Service is conditioned on Your
          acceptance of and compliance with these Terms and Conditions. These
          Terms and Conditions apply to all visitors, users and others who
          access or use the Service.
        </p>
        <p>
          By accessing or using the Service You agree to be bound by these Terms
          and Conditions. If You disagree with any part of these Terms and
          Conditions then You may not access the Service.
        </p>
        <p>
          You represent that you are over the age of 18. The Company does not
          permit those under 18 to use the Service.
        </p>
        <p>
          Your access to and use of the Service is also conditioned on Your
          acceptance of and compliance with the Privacy Policy of the Company.
          Our Privacy Policy describes Our policies and procedures on the
          collection, use and disclosure of Your personal information when You
          use the Application or the Website and tells You about Your privacy
          rights and how the law protects You. Please read Our Privacy Policy
          carefully before using Our Service.
        </p>
        <h1>User Accounts</h1>
        <p>
          When You create an account with Us, You must provide Us information
          that is accurate, complete, and current at all times. Failure to do so
          constitutes a breach of the Terms, which may result in immediate
          termination of Your account on Our Service.
        </p>
        <p>
          You are responsible for safeguarding the password that You use to
          access the Service and for any activities or actions under Your
          password, whether Your password is with Our Service or a Third-Party
          Social Media Service.
        </p>
        <p>
          You agree not to disclose Your password to any third party. You must
          notify Us immediately upon becoming aware of any breach of security or
          unauthorized use of Your account.
        </p>
        <p>
          You may not use as a username the name of another person or entity or
          that is not lawfully available for use, a name or trademark that is
          subject to any rights of another person or entity other than You
          without appropriate authorization, or a name that is otherwise
          offensive, vulgar or obscene.
        </p>
        <h1>Content</h1>
        <h2>Content and Data Ownership</h2>
        <p>
          Our Service allows You to post Content. You are responsible for the
          Content that You post to the Service, including its legality,
          reliability, and appropriateness.
        </p>
        <p>
          All data generated by the Aqualink system or posted by our users is
          governed by the Creative Commons{' '}
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode">
            CC BY-NC-SA
          </a>{' '}
          license. This license allows reusers to distribute, remix, adapt, and
          build upon the material in any medium or format for noncommercial
          purposes only, and only so long as attribution is given to the
          creator. If you remix, adapt, or build upon the material, you must
          license the modified material under identical terms.
        </p>
        <p>
          When you post content you represent and warrant that: (i) the Content
          is Yours (You own it) or You have the right to use it and grant Us the
          rights and license as provided in these Terms, and (ii) the posting of
          Your Content on or through the Service does not violate the privacy
          rights, publicity rights, copyrights, contract rights or any other
          rights of any person.
        </p>
        <h2>Content Restrictions</h2>
        <p>
          The Company is not responsible for the content of the Service&apos;s
          users. You expressly understand and agree that You are solely
          responsible for the Content and for all activity that occurs under
          your account, whether done so by You or any third person using Your
          account.
        </p>
        <p>
          You may not transmit any Content that is unlawful, offensive,
          upsetting, intended to disgust, threatening, libelous, defamatory,
          obscene or otherwise objectionable. Examples of such objectionable
          Content include, but are not limited to, the following:
        </p>
        <ul>
          <li>Unlawful or promoting unlawful activity.</li>
          <li>
            Defamatory, discriminatory, or mean-spirited content, including
            references or commentary about religion, race, sexual orientation,
            gender, national/ethnic origin, or other targeted groups.
          </li>
          <li>
            Spam, machine – or randomly – generated, constituting unauthorized
            or unsolicited advertising, chain letters, any other form of
            unauthorized solicitation, or any form of lottery or gambling.
          </li>
          <li>
            Containing or installing any viruses, worms, malware, trojan horses,
            or other content that is designed or intended to disrupt, damage, or
            limit the functioning of any software, hardware or
            telecommunications equipment or to damage or obtain unauthorized
            access to any data or other information of a third person.
          </li>
          <li>
            Infringing on any proprietary rights of any party, including patent,
            trademark, trade secret, copyright, right of publicity or other
            rights.
          </li>
          <li>
            Impersonating any person or entity including the Company and its
            employees or representatives.
          </li>
          <li>Violating the privacy of any third person.</li>
          <li>False information and features.</li>
        </ul>
        <p>
          The Company reserves the right, but not the obligation, to, in its
          sole discretion, determine whether or not any Content is appropriate
          and complies with this Terms, refuse or remove this Content. The
          Company further reserves the right to make formatting and edits and
          change the manner any Content. The Company can also limit or revoke
          the use of the Service if You post such objectionable Content. As the
          Company cannot control all content posted by users and/or third
          parties on the Service, you agree to use the Service at your own risk.
          You understand that by using the Service You may be exposed to content
          that You may find offensive, indecent, incorrect or objectionable, and
          You agree that under no circumstances will the Company be liable in
          any way for any content, including any errors or omissions in any
          content, or any loss or damage of any kind incurred as a result of
          your use of any content.
        </p>
        <h2>Content Backups</h2>
        <p>
          Although regular backups of Content are performed, the Company do not
          guarantee there will be no loss or corruption of data.
        </p>
        <p>
          Corrupt or invalid backup points may be caused by, without limitation,
          Content that is corrupted prior to being backed up or that changes
          during the time a backup is performed.
        </p>
        <p>
          The Company will provide support and attempt to troubleshoot any known
          or discovered issues that may affect the backups of Content. But You
          acknowledge that the Company has no liability related to the integrity
          of Content or the failure to successfully restore Content to a usable
          state.
        </p>
        <p>
          You agree to maintain a complete and accurate copy of any Content in a
          location independent of the Service.
        </p>
        <h1>Copyright Policy</h1>
        <h2>Intellectual Property Infringement</h2>
        <p>
          We respect the intellectual property rights of others. It is Our
          policy to respond to any claim that Content posted on the Service
          infringes a copyright or other intellectual property infringement of
          any person.
        </p>
        <p>
          If You are a copyright owner, or authorized on behalf of one, and You
          believe that the copyrighted work has been copied in a way that
          constitutes copyright infringement that is taking place through the
          Service, You must submit Your notice in writing to the attention of
          our copyright agent via email at info@aqualink.org and include in Your
          notice a detailed description of the alleged infringement.
        </p>
        <p>
          You may be held accountable for damages (including costs and
          attorneys&apos; fees) for misrepresenting that any Content is
          infringing Your copyright.
        </p>
        <h2>
          DMCA Notice and DMCA Procedure for Copyright Infringement Claims
        </h2>
        <p>
          You may submit a notification pursuant to the Digital Millennium
          Copyright Act (DMCA) by providing our Copyright Agent with the
          following information in writing (see 17 U.S.C 512(c)(3) for further
          detail):
        </p>
        <ul>
          <li>
            An electronic or physical signature of the person authorized to act
            on behalf of the owner of the copyright&apos;s interest.
          </li>
          <li>
            A description of the copyrighted work that You claim has been
            infringed, including the URL (i.e., web page address) of the
            location where the copyrighted work exists or a copy of the
            copyrighted work.
          </li>
          <li>
            Identification of the URL or other specific location on the Service
            where the material that You claim is infringing is located.
          </li>
          <li>Your address, telephone number, and email address.</li>
          <li>
            A statement by You that You have a good faith belief that the
            disputed use is not authorized by the copyright owner, its agent, or
            the law.
          </li>
          <li>
            A statement by You, made under penalty of perjury, that the above
            information in Your notice is accurate and that You are the
            copyright owner or authorized to act on the copyright owne&apos;s
            behalf.
          </li>
        </ul>
        <p>You can contact our copyright agent via em...</p>
      </Container>
      <Footer />
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: '2rem',
      marginBottom: '2rem',
    },
  });

type TermsProps = WithStyles<typeof styles>;

export default withStyles(styles)(Terms);
