package gordo.peluche.Entidades;
import jakarta.persistence.*;



@Entity
public class compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int idcli;
    private List<Peluche> peluches;
    private int iva;
    private float subtotal;
    private float total;

}
